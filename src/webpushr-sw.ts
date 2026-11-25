import { UrlUtils_build } from "./utils/url";

declare let __COMMIT_HASH__: string;
const cacheName = `liftosaur-sw-${__COMMIT_HASH__}`;

const filesToCache = [
  `./app.js?version=${__COMMIT_HASH__}`,
  `./app.css?version=${__COMMIT_HASH__}`,
  `./vendors.js?vendor=${__COMMIT_HASH__}`,
  "./images/back-muscles.svg",
  "./images/front-muscles.svg",
  "./images/svgs/muscles-combined.svg",
  /^fonts\/.*/,
  /^programdata\/.*\.json/,
  /^exercisedata\/.*\.json/,
  /^chunks\/.*\.js/,
  /^images\/.*/,
  /^[0-9a-f]{20}\.(png|jpg|svg|webp)$/,
  "./",
  "./index.html",
  "./rollbar-stub.js",
  "./icons/icon192.png",
  "./icons/icon512.png",
  "./notification.m4r",
  "./set-timer-end.m4r",
  "./get-ready-end.m4r",
];

function scopeUrl(path: string): string {
  return UrlUtils_build(path, (self as unknown as ServiceWorkerGlobalScope).registration.scope).href;
}

function withoutQuery(href: string): string {
  const url = UrlUtils_build(href);
  url.search = "";
  url.hash = "";
  return url.href;
}

async function cacheProgramData(cache: Cache): Promise<void> {
  const indexUrl = scopeUrl(`./programdata/index.json?v=${__COMMIT_HASH__}`);
  const response = await fetch(indexUrl);
  if (!response.ok) {
    throw new Error(`programdata index ${response.status}`);
  }
  await cache.put(indexUrl, response.clone());
  const index = (await response.json()) as { id: string }[];
  const urls = index.map((p) => scopeUrl(`./programdata/programs/builtin/${p.id}.json?v=${__COMMIT_HASH__}`));
  await cache.addAll(urls);
  await cache.add(scopeUrl(`./exercisedata/descriptions.json?v=${__COMMIT_HASH__}`));
}

// personal-fork: GitHub Pages serves every project of the account from one origin, so only URLs under this
// app's scope are matched, and only successful same-origin responses are stored
function isCacheable(requestUrl: string): boolean {
  const scope = (self as unknown as ServiceWorkerGlobalScope).registration.scope;
  if (!requestUrl.startsWith(scope)) {
    return false;
  }
  const relative = requestUrl.slice(scope.length);
  return filesToCache.some((f) => (typeof f === "string" ? scopeUrl(f) === requestUrl : f.test(relative)));
}

function cacheRequest(request: Request, response: Response): Promise<Response> {
  if (!response.ok || response.type !== "basic") {
    return Promise.resolve(response);
  }
  return caches.open(cacheName).then((cache) => {
    console.log("[Service Worker] Caching new resource: " + request.url);

    cache.put(request, response.clone());
    return response;
  });
}

function initialize(service: ServiceWorkerGlobalScope): void {
  service.addEventListener("install", (event) => {
    service.skipWaiting();
    event.waitUntil(
      caches.open(cacheName).then((cache) => {
        return cache
          .addAll(filesToCache.filter((f): f is string => typeof f === "string").map(scopeUrl))
          .then(() =>
            cacheProgramData(cache).catch((err) => console.error("[Service Worker] Program data not cached", err))
          );
      })
    );
  });

  service.addEventListener("fetch", (e) => {
    const url = UrlUtils_build(e.request.url);
    if (
      e.request.method === "GET" &&
      (withoutQuery(url.href) === scopeUrl("./") || withoutQuery(url.href) === scopeUrl("./index.html"))
    ) {
      console.log("[Service Worker] Fetching " + e.request.url);
      e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then((r) => {
          return fetch(e.request)
            .then((response) => cacheRequest(e.request, response))
            .catch((err) => {
              if (r != null) {
                console.log("[Service Worker] Can't fetch, so using cache for: " + e.request.url);
                console.error(err);
                return r;
              } else {
                throw e;
              }
            });
        })
      );
    } else {
      console.log("[Service Worker] Checking the resource in cache: " + e.request.url);

      e.respondWith(
        caches.match(e.request).then((r) => {
          if (r) {
            console.log("[Service Worker] Returning from cache: " + e.request.url);
            return r;
          } else {
            console.log("[Service Worker] Missing from cache, fetching resource: " + e.request.url);
            return fetch(e.request).then((response) => {
              if (e.request.method === "GET" && isCacheable(e.request.url)) {
                return cacheRequest(e.request, response);
              } else {
                return response;
              }
            });
          }
        })
      );
    }
  });

  // personal-fork: delete only this app's older caches; other apps on the same origin keep theirs
  service.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k.startsWith("liftosaur-sw-") && k !== cacheName).map((k) => caches.delete(k)))
        )
        .then(() => service.clients.claim())
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
initialize(self as any);

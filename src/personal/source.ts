const GITHUB_PAGES_HOST = /^([a-z0-9-]+)\.github\.io$/i;

// personal-fork: AGPL-3.0 asks the modified app to offer its source; on GitHub Pages the repository is known from the URL
export function PersonalSource_url(hostname: string, pathname: string, commit: string | undefined): string | undefined {
  const match = hostname.match(GITHUB_PAGES_HOST);
  if (match == null) {
    return undefined;
  }
  const user = match[1];
  const firstSegment = pathname.split("/").filter((p) => p !== "")[0];
  const repo = firstSegment != null && !firstSegment.includes(".") ? firstSegment : `${user}.github.io`;
  const base = `https://github.com/${user}/${repo}`;
  return commit ? `${base}/tree/${commit}` : base;
}

declare let __COMMIT_HASH__: string;

export function PersonalSource_current(): string | undefined {
  if (typeof window === "undefined" || window.location == null) {
    return undefined;
  }
  const commit = typeof __COMMIT_HASH__ !== "undefined" ? __COMMIT_HASH__ : undefined;
  return PersonalSource_url(window.location.hostname, window.location.pathname, commit);
}

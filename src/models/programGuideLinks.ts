const prefix = "#program-guide:";
const siteHost = /^https?:\/\/(?:www\.)?liftosaur\.com(?=\/|$)/;
const linkPattern = /(!?)\[((?:[^\[\]]|\[[^\]]*\])*)\]\(\s*([^)\s]+)(\s+"[^"]*")?\s*\)/g;

function pathOf(href: string): string | undefined {
  if (href.startsWith("/")) {
    return href;
  }
  if (siteHost.test(href)) {
    return href.replace(siteHost, "") || "/";
  }
  return undefined;
}

export function ProgramGuideLinks_programId(href: string): string | undefined {
  if (href.startsWith(prefix)) {
    return decodeURIComponent(href.slice(prefix.length)) || undefined;
  }
  return undefined;
}

export function ProgramGuideLinks_externalUrl(url: string): string | undefined {
  if (!url || siteHost.test(url)) {
    return undefined;
  }
  return url;
}

export function ProgramGuideLinks_rewrite(markdown: string, knownIds: string[]): string {
  return markdown.replace(linkPattern, (whole, bang: string, text: string, href: string) => {
    if (bang) {
      return whole;
    }
    const path = pathOf(href);
    if (path == null) {
      return whole;
    }
    const match = path.match(/^\/programs\/([^/?#]+)\/?(?:[?#].*)?$/);
    if (match == null) {
      return siteHost.test(href) ? text : whole;
    }
    const id = decodeURIComponent(match[1]);
    return knownIds.indexOf(id) !== -1 ? `[${text}](${prefix}${encodeURIComponent(id)})` : text;
  });
}

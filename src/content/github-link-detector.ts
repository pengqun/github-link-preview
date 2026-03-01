const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/;

export function isGitHubRepoLink(element: HTMLElement): boolean {
  if (element.tagName.toLowerCase() !== "a") return false;
  const href = (element as HTMLAnchorElement).href;
  return GITHUB_REPO_REGEX.test(href);
}

export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export function isGitHubHovercard(element: HTMLElement): boolean {
  return element.hasAttribute("data-hovercard-type");
}

export function shouldShowPopup(element: HTMLElement): boolean {
  return isGitHubRepoLink(element) && !isGitHubHovercard(element);
}

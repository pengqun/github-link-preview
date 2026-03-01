import { describe, it, expect } from "vitest";
import {
  parseGitHubUrl,
  isGitHubRepoLink,
  isGitHubHovercard,
  shouldShowPopup,
} from "@/content/github-link-detector";

describe("parseGitHubUrl", () => {
  it("parses valid GitHub repo URLs", () => {
    expect(parseGitHubUrl("https://github.com/facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });
    expect(parseGitHubUrl("https://github.com/pengqun/github-link-preview/")).toEqual({
      owner: "pengqun",
      repo: "github-link-preview",
    });
  });

  it("returns null for non-repo GitHub URLs", () => {
    expect(parseGitHubUrl("https://github.com/facebook")).toBeNull();
    expect(parseGitHubUrl("https://github.com/")).toBeNull();
    expect(parseGitHubUrl("https://github.com")).toBeNull();
  });

  it("returns null for sub-paths beyond repo", () => {
    expect(
      parseGitHubUrl("https://github.com/facebook/react/issues"),
    ).toBeNull();
    expect(
      parseGitHubUrl("https://github.com/facebook/react/pulls"),
    ).toBeNull();
    expect(
      parseGitHubUrl("https://github.com/facebook/react/blob/main/README.md"),
    ).toBeNull();
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseGitHubUrl("https://gitlab.com/user/repo")).toBeNull();
    expect(parseGitHubUrl("https://example.com")).toBeNull();
  });
});

describe("isGitHubRepoLink", () => {
  it("returns true for anchor elements with GitHub repo hrefs", () => {
    const el = document.createElement("a");
    el.href = "https://github.com/facebook/react";
    expect(isGitHubRepoLink(el)).toBe(true);
  });

  it("returns false for non-anchor elements", () => {
    const el = document.createElement("div");
    expect(isGitHubRepoLink(el)).toBe(false);
  });

  it("returns false for non-GitHub links", () => {
    const el = document.createElement("a");
    el.href = "https://example.com/foo/bar";
    expect(isGitHubRepoLink(el)).toBe(false);
  });
});

describe("isGitHubHovercard", () => {
  it("returns true for elements with data-hovercard-type", () => {
    const el = document.createElement("a");
    el.setAttribute("data-hovercard-type", "repository");
    expect(isGitHubHovercard(el)).toBe(true);
  });

  it("returns false for elements without data-hovercard-type", () => {
    const el = document.createElement("a");
    expect(isGitHubHovercard(el)).toBe(false);
  });
});

describe("shouldShowPopup", () => {
  it("returns true for GitHub repo links without hovercards", () => {
    const el = document.createElement("a");
    el.href = "https://github.com/facebook/react";
    expect(shouldShowPopup(el)).toBe(true);
  });

  it("returns false for GitHub repo links with hovercards", () => {
    const el = document.createElement("a");
    el.href = "https://github.com/facebook/react";
    el.setAttribute("data-hovercard-type", "repository");
    expect(shouldShowPopup(el)).toBe(false);
  });
});

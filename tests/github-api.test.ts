import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRepoInfo } from "@/services/github-api";

describe("fetchRepoInfo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and transforms repo data correctly", async () => {
    const mockData = {
      full_name: "facebook/react",
      description: "A JavaScript library for building user interfaces",
      stargazers_count: 220000,
      forks_count: 45000,
      language: "JavaScript",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
      pushed_at: "2024-01-15T12:00:00Z",
      visibility: "public",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchRepoInfo("facebook", "react");

    expect(result).toEqual({
      fullName: "facebook/react",
      description: "A JavaScript library for building user interfaces",
      stars: 220000,
      forks: 45000,
      language: "JavaScript",
      authorLogin: "facebook",
      authorAvatarUrl:
        "https://avatars.githubusercontent.com/u/69631?v=4",
      lastCommit: "2024-01-15T12:00:00Z",
      visibility: "public",
    });
  });

  it("sends Authorization header when token is provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ full_name: "a/b", owner: {} }),
    } as Response);

    await fetchRepoInfo("a", "b", "my-token");

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers["Authorization"]).toBe("Bearer my-token");
  });

  it("does not send Authorization header without token", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ full_name: "a/b", owner: {} }),
    } as Response);

    await fetchRepoInfo("a", "b");

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("returns null on 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const result = await fetchRepoInfo("nonexistent", "repo");
    expect(result).toBeNull();
  });

  it("returns null on 403 (rate limit)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response);

    const result = await fetchRepoInfo("facebook", "react");
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error"),
    );

    const result = await fetchRepoInfo("facebook", "react");
    expect(result).toBeNull();
  });
});

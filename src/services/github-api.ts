import type { GitHubRepoInfo } from "@/types";

export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token?: string,
): Promise<GitHubRepoInfo | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const headers: Record<string, string> = {
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Repository not found");
      } else if (response.status === 403) {
        throw new Error("API rate limit reached or authentication failed");
      } else {
        throw new Error(
          `Error fetching repository data: ${response.statusText}`,
        );
      }
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("API returned invalid data");
    }

    return {
      fullName: data.full_name || "Unknown",
      description: data.description || "No description available",
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || null,
      authorLogin: data.owner?.login || "Unknown",
      authorAvatarUrl: data.owner?.avatar_url || "",
      lastCommit: data.pushed_at || "Unknown",
      visibility: data.visibility || "Unknown",
    };
  } catch (error) {
    console.error(`Failed to fetch repository data for ${url}:`, error);
    return null;
  }
}

export interface GitHubRepoInfo {
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  authorLogin: string;
  authorAvatarUrl: string;
  lastCommit: string;
  visibility: string;
}

export interface ExtensionSettings {
  enabled: boolean;
  githubToken: string;
  popupDelay: number;
}

import type { GitHubRepoInfo } from "@/types";
import { formatNumber, formatRelativeDate, capitalizeFirstLetter } from "@/utils/format";
import { getLanguageColor } from "@/utils/language-colors";

const POPUP_DIV_ID = "preview-popup";
const POPUP_CONTENT_CLASS = "popup-content";

export function renderPopup(info: GitHubRepoInfo): HTMLDivElement {
  const popup = document.createElement("div");
  popup.id = POPUP_DIV_ID;

  const languageHtml = info.language
    ? `<span class="language">
        <span class="repo-language-color" style="background-color: ${getLanguageColor(info.language)}"></span>
        ${info.language}
      </span>`
    : "";

  popup.innerHTML = `
    <div class="${POPUP_CONTENT_CLASS}">
      <h2>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="repo-icon">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <span class="repo-name">${info.fullName}</span>
        <span class="repo-visibility">${capitalizeFirstLetter(info.visibility)}</span>
      </h2>
      <p>${info.description}</p>
      <div class="repo-stats">
        ${languageHtml}
        <span class="stat-item">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
          </svg>
          ${formatNumber(info.stars)}
        </span>
        <span class="stat-item">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
          </svg>
          ${formatNumber(info.forks)}
        </span>
        <span class="last-commit">Updated ${formatRelativeDate(info.lastCommit)}</span>
      </div>
    </div>
  `;
  return popup;
}

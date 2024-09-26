const POPUP_DIV_ID = "preview-popup";
const POPUP_CONTENT_CLASS = "popup-content";

const CREATE_DELAY_MILLIS = 100;
const REMOVE_DELAY_MILLIS = 100;

let isEnabled = true;

chrome.storage.sync.get({ enabled: true }, function (items) {
  isEnabled = items.enabled;
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "sync" && "enabled" in changes) {
    isEnabled = changes.enabled.newValue;
  }
});

// Make sure only one popup is open at a time
let currentPopup = null;
let lastTarget = null;

// Delay popup generation to avoid too many requests
let popupTimeout = null;

// Control popup visibility
let isMouseOverPopup = false;
let isMouseOverLink = false;

document.addEventListener("mouseover", (event) => {
  if (!isEnabled) {
    return;
  }
  const target = event.target;

  if (shouldShowPopup(target)) {
    console.debug("Hovering over GitHub link: ", target.href);
    isMouseOverLink = true;

    if (lastTarget !== target) {
      lastTarget = target;
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    }

    if (popupTimeout) {
      clearTimeout(popupTimeout);
    }
    popupTimeout = setTimeout(async () => {
      await createNewPopup(target);
    }, CREATE_DELAY_MILLIS);
  }
});

document.addEventListener("mouseout", function (event) {
  const target = event.target;
  if (shouldShowPopup(target)) {
    isMouseOverLink = false;
    setTimeout(() => {
      if (!isMouseOverPopup && currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    }, REMOVE_DELAY_MILLIS);
  }
});

function shouldShowPopup(target) {
  return isGitHubLink(target) && !isGitHubHovercard(target);
}

function isGitHubLink(target) {
  return (
    target.tagName.toLowerCase() === "a" &&
    target.href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/)
  );
}

// Avoid repeative popups on GitHub official hovercards
function isGitHubHovercard(target) {
  return target.hasAttribute("data-hovercard-type");
}

async function createNewPopup(target) {
  const repoUrlParts = target.href.split("/");
  const owner = repoUrlParts[3];
  const repo = repoUrlParts[4];

  const info = await fetchGitHubRepoInfo(owner, repo);
  if (info == null) {
    return;
  }

  if (currentPopup) {
    currentPopup.remove();
  }
  const popup = generatePopupDOM(info);
  document.body.appendChild(popup);
  currentPopup = popup;

  setupPopupPosition(target, popup);

  popup.addEventListener("mouseover", () => {
    isMouseOverPopup = true;
  });

  popup.addEventListener("mouseout", () => {
    isMouseOverPopup = false;
    setTimeout(() => {
      if (!isMouseOverPopup && !isMouseOverLink) {
        popup.remove();
        currentPopup = null;
      }
    }, REMOVE_DELAY_MILLIS);
  });
}

async function fetchGitHubRepoInfo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  let token;
  try {
    token = await new Promise((resolve, reject) => {
      if (!chrome.runtime?.id) {
        reject(new Error("Extension context invalidated"));
        return;
      }
      chrome.storage.sync.get({ githubToken: "" }, (items) => {
        if (chrome.runtime.lastError) {
          reject(new Error("Unable to retrieve GitHub token"));
        } else {
          resolve(items.githubToken);
        }
      });
    });
  } catch (error) {
    console.error("Error retrieving GitHub token:", error);
    // Continue execution, but without using the token
    token = "";
  }

  try {
    const headers = {
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
          `Error fetching repository data: ${response.statusText}`
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
    console.error(`Failed to fetch repository data for url ${url}: ${error}`);
    return null;
  }
}

function generatePopupDOM(info) {
  const popup = document.createElement("div");
  popup.id = POPUP_DIV_ID;
  popup.innerHTML = `
    <div class="${POPUP_CONTENT_CLASS}">
      <h2>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="repo-icon">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <span class="repo-name">${info.fullName}</span>
                <span class="repo-visibility">${capitalizeFirstLetter(
                  info.visibility
                )}</span>
      </h2>
      <p>${info.description || "No description available"}</p>
      <div class="repo-stats">
        ${
          info.language
            ? `
        <span class="language">
          <span class="repo-language-color" style="background-color: ${getLanguageColor(
            info.language
          )}"></span>
          ${info.language}
        </span>
        `
            : ""
        }
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
        <span class="last-commit">Updated ${formatDate(info.lastCommit)}</span>
      </div>
    </div>
  `;
  return popup;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays <= 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    return `on ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
}

function setupPopupPosition(target, popup) {
  const rect = target.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let top = rect.bottom + window.scrollY;
  let left = rect.left + window.scrollX;

  // Check right boundary
  if (left + popupRect.width > window.innerWidth) {
    left = window.innerWidth - popupRect.width - 10;
  }

  // Check bottom boundary
  if (top + popupRect.height > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - popupRect.height;
  }

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
}

function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    TypeScript: "#2b7489",
    C: "#555555",
    "C++": "#f34b7d",
  };
  return colors[language] || "#bbbbbb";
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

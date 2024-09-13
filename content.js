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

  if (isGitHubLink(target)) {
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
  if (isGitHubLink(target)) {
    isMouseOverLink = false;
    setTimeout(() => {
      if (!isMouseOverPopup && currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    }, REMOVE_DELAY_MILLIS);
  }
});

function isGitHubLink(target) {
  return (
    target.tagName.toLowerCase() === "a" &&
    target.href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/)
  );
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
    return null;
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
      authorLogin: data.owner?.login || "Unknown",
      authorAvatarUrl: data.owner?.avatar_url || "",
      lastCommit: data.pushed_at || "Unknown",
    };
  } catch (error) {
    console.debug("Failed to fetch repository data", error);
    return null;
  }
}

function generatePopupDOM(info) {
  const popup = document.createElement("div");
  popup.id = POPUP_DIV_ID;
  popup.innerHTML = `
    <div class="${POPUP_CONTENT_CLASS}">
      <h2>${info.fullName}</h2>
      <p>${info.description || "No description available"}</p>
      <div class="repo-stats">
        <span>
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
          </svg>
          ${formatStars(info.stars)}
        </span>
        <span>
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
          </svg>
          ${info.forks || 0}
        </span>
        <span>Updated ${formatDate(info.lastCommit)}</span>
      </div>
    </div>
  `;
  return popup;
}

function formatStars(stars) {
  if (stars >= 10000) {
    return Math.floor(stars / 1000) + "k";
  } else if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + "k";
  } else {
    return stars.toString();
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays <= 30) {
    return `${diffDays} days ago`;
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
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

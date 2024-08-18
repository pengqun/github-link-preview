const POPUP_DIV_ID = "preview-popup";
const POPUP_CONTENT_CLASS = "popup-content";

// Make sure only one popup is open at a time
let currentPopup = null;
let lastTarget = null;

// Delay popup generation to avoid too many requests
let popupTimeout = null;

// Control popup visibility
let isMouseOverPopup = false;
let isMouseOverLink = false;

document.addEventListener("mouseover", (event) => {
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
    }, 100);
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
    }, 100);
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
    }, 100);
  });
}

async function fetchGitHubRepoInfo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching repository data: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      fullName: data.full_name,
      description: data.description || "No description available",
      stars: data.stargazers_count,
      authorLogin: data.owner.login,
      authorAvatarUrl: data.owner.avatar_url,
      lastCommit: new Date(data.pushed_at).toLocaleString(),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function generatePopupDOM(info) {
  const popup = document.createElement("div");
  popup.id = POPUP_DIV_ID;
  popup.innerHTML = `
    <div class="${POPUP_CONTENT_CLASS}">
      <h2>${info.fullName}</h2>
      <p>${info.description}</p>
      <p><strong>⭐ Stars:</strong> ${info.stars}</p>
      <p><strong>👤 Author:</strong> <img src="${info.authorAvatarUrl}" width="20" height="20"> ${info.authorLogin}</p>
      <p><strong>Last commit:</strong> ${info.lastCommit}</p>
    </div>
  `;
  return popup;
}

function setupPopupPosition(target, popup) {
  const rect = target.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

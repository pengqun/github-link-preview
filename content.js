const POPUP_DIV_ID = "preview-popup";
const POPUP_CONTENT_CLASS = "popup-content";

const CREATE_DELAY_MILLIS = 100;
const REMOVE_DELAY_MILLIS = 100;

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
      <p style="margin-bottom: 10px">${info.description}</p>
      <p><strong>⭐ Stars: ${formatStars(info.stars)}</strong></p>
      <p><strong>👤 Author: <img src="${
        info.authorAvatarUrl
      }" width="20" height="20"> ${info.authorLogin}</strong></p>
      <p><strong>📅️️️ Last commit: ${info.lastCommit}</strong></p>
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

function setupPopupPosition(target, popup) {
  const rect = target.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

const POPUP_DIV_ID = "preview-popup";
const POPUP_CONTENT_CLASS = "popup-content";

// Make sure only one popup is open at a time
let currentPopup = null;

// Delay popup generation to avoid too many requests
let popupTimeout = null;

document.addEventListener("mouseover", (event) => {
  const target = event.target;
  if (
    target.tagName.toLowerCase() === "a" &&
    target.href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/)
  ) {
    console.debug("Hovering over GitHub link: ", target.href);

    if (popupTimeout) {
      clearTimeout(popupTimeout);
    }
    popupTimeout = setTimeout(async () => {
      // Clear old popup
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
      await createNewPopup(target);
    }, 100);
  }
});

async function createNewPopup(target) {
  const repoUrlParts = target.href.split("/");
  const owner = repoUrlParts[3];
  const repo = repoUrlParts[4];

  const info = await fetchGitHubRepoInfo(owner, repo);

  const popup = generatePopupDOM(info);
  currentPopup = popup;

  setupPopupPosition(target, popup);

  document.body.appendChild(popup);

  target.addEventListener("mouseout", () => {
    popup.remove();
  });
}

function setupPopupPosition(target, popup) {
  const rect = target.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
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

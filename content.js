document.addEventListener("mouseover", async function (event) {
  const target = event.target;
  if (
    target.tagName.toLowerCase() === "a" &&
    target.href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/)
  ) {
    console.log("Hovering over GitHub link: ", target.href);
    await generatePreviewPopup(target);
  }
});

const POPUP_DIV_ID = "preview-popup";

async function generatePreviewPopup(target) {
  let existingPopup = document.getElementById(POPUP_DIV_ID);
  if (existingPopup) {
    existingPopup.remove();
  }

  const repoUrlParts = target.href.split("/");
  const owner = repoUrlParts[3];
  const repo = repoUrlParts[4];

  const info = await fetchGitHubRepoInfo(owner, repo);

  const popup = document.createElement("div");
  popup.id = POPUP_DIV_ID;
  popup.innerHTML = `
      <div class="popup-content">
        <h2>${info.fullName}</h2>
        <p>${info.description}</p>
        <p><strong>⭐ Stars:</strong> ${info.stars}</p>
        <p><strong>👤 Author:</strong> <img src="${info.authorAvatarUrl}" width="20" height="20"> ${info.authorLogin}</p>
        <p><strong>Last commit:</strong> ${info.lastCommit}</p>
      </div>
    `;

  document.body.appendChild(popup);

  const rect = target.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  target.addEventListener("mouseout", () => {
    popup.remove();
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

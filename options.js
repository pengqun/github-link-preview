// Saves options to chrome.storage
const saveOptions = () => {
  const githubToken = document.getElementById("github-token").value;

  chrome.storage.sync.set({ githubToken: githubToken }, () => {
    // Update status to let user know options were saved.
    const status = document.createElement("div");
    status.id = "status";
    status.textContent = "Options saved.";
    document.body.appendChild(status);
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores input box state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ githubToken: "" }, (items) => {
    document.getElementById("github-token").value = items.githubToken;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector(".save-button").addEventListener("click", saveOptions);

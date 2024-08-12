document.addEventListener("mouseover", function (event) {
  const target = event.target;
  if (
    target.tagName.toLowerCase() === "a" &&
    target.href.startsWith("https://github.com")
  ) {
    const linkHref = target.href;
    console.log("Hovering over GitHub link: ", linkHref);

    let existingPopup = document.getElementById("preview-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "preview-popup";
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Custom Title</h2>
            <p>This is a custom popup content for the link: ${target.href}</p>
        </div>
    `;

    document.body.appendChild(popup);

    const rect = target.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    target.addEventListener("mouseout", () => {
      popup.remove();
    });

    // chrome.runtime.sendMessage({ type: "hovered_link", url: linkHref });
  }
});

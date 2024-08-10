document.addEventListener("mouseover", function (event) {
  const target = event.target;
  if (target.tagName.toLowerCase() === "a") {
    const linkHref = target.href;
    console.log("Hovering over link:", linkHref);

    target.style.color = "orange";
    chrome.runtime.sendMessage({ type: "hovered_link", url: linkHref });
  }
  //   await chrome.scripting.insertCSS({
  //     files: ["preview.css"],
  //     target: { tabId: tab.id },
  //   });
});

document.addEventListener("DOMContentLoaded", function () {
  const optionsButton = document.getElementById("go-to-options");
  const enableToggle = document.getElementById("enableToggle");

  optionsButton.addEventListener("click", function () {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });

  // 加载当前的启用状态
  chrome.storage.sync.get({ enabled: true }, function (items) {
    enableToggle.checked = items.enabled;
  });

  // 当开关状态改变时保存设置
  enableToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ enabled: this.checked }, function () {
      // console.debug("Extension " + (this.checked ? "enabled" : "disabled"));
    });
  });
});

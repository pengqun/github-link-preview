import { shouldShowPopup, parseGitHubUrl } from "./github-link-detector";
import { renderPopup } from "./popup-renderer";
import { applyPosition } from "./popup-positioner";
import { fetchRepoInfo } from "@/services/github-api";
import { getSettings, onSettingsChange } from "@/utils/storage";

const DEFAULT_REMOVE_DELAY = 300;

let isEnabled = true;
let popupDelay = 500;
let githubToken = "";

let currentPopup: HTMLDivElement | null = null;
let lastTarget: HTMLElement | null = null;
let popupTimeout: ReturnType<typeof setTimeout> | null = null;
let isMouseOverPopup = false;
let isMouseOverLink = false;
let currentHoverTarget: HTMLElement | null = null;

function removePopup(): void {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

function scheduleRemove(): void {
  setTimeout(() => {
    if (!isMouseOverPopup && !isMouseOverLink) {
      removePopup();
    }
  }, DEFAULT_REMOVE_DELAY);
}

async function createPopup(target: HTMLAnchorElement): Promise<void> {
  const parsed = parseGitHubUrl(target.href);
  if (!parsed) return;

  const info = await fetchRepoInfo(parsed.owner, parsed.repo, githubToken);
  if (!info) return;

  removePopup();
  const popup = renderPopup(info);
  document.body.appendChild(popup);
  currentPopup = popup;

  applyPosition(popup, target);

  popup.addEventListener("mouseover", () => {
    isMouseOverPopup = true;
  });

  popup.addEventListener("mouseout", () => {
    isMouseOverPopup = false;
    scheduleRemove();
  });
}

function handleMouseOver(event: MouseEvent): void {
  if (!isEnabled) return;

  const target = event.target as HTMLElement;
  if (!shouldShowPopup(target)) return;

  isMouseOverLink = true;
  currentHoverTarget = target;

  if (lastTarget !== target) {
    lastTarget = target;
    removePopup();
  }

  if (popupTimeout) {
    clearTimeout(popupTimeout);
  }

  popupTimeout = setTimeout(async () => {
    if (isMouseOverLink && target === currentHoverTarget) {
      await createPopup(target as HTMLAnchorElement);
    }
  }, popupDelay);
}

function handleMouseOut(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!shouldShowPopup(target)) return;

  isMouseOverLink = false;
  if (target === currentHoverTarget) {
    currentHoverTarget = null;
  }

  if (popupTimeout) {
    clearTimeout(popupTimeout);
    popupTimeout = null;
  }

  scheduleRemove();
}

export async function init(): Promise<void> {
  const settings = await getSettings();
  isEnabled = settings.enabled;
  popupDelay = settings.popupDelay;
  githubToken = settings.githubToken;

  onSettingsChange((changes) => {
    if (changes.enabled !== undefined) isEnabled = changes.enabled;
    if (changes.popupDelay !== undefined) popupDelay = changes.popupDelay;
    if (changes.githubToken !== undefined) githubToken = changes.githubToken;
  });

  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
}

const PLAYBACK_KEYS = new Set(["ArrowLeft", "ArrowRight", " "]);
const INTERACTIVE_TAGS = new Set(["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"]);

export function shouldHandleVisualizerShortcut({
  key,
  tagName,
  isContentEditable,
  insideVisualizer,
}) {
  if (!insideVisualizer || isContentEditable) return false;
  if (INTERACTIVE_TAGS.has(String(tagName).toUpperCase())) return false;
  return PLAYBACK_KEYS.has(key);
}

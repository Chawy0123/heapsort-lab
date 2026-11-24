import test from "node:test";
import assert from "node:assert/strict";

import { shouldHandleVisualizerShortcut } from "../src/keyboard-shortcuts.js";

test("visualizer shortcuts ignore buttons, links, form controls, and editable content", () => {
  for (const tagName of ["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"]) {
    assert.equal(
      shouldHandleVisualizerShortcut({
        key: " ",
        tagName,
        isContentEditable: false,
        insideVisualizer: true,
      }),
      false,
    );
  }
  assert.equal(
    shouldHandleVisualizerShortcut({
      key: "ArrowRight",
      tagName: "DIV",
      isContentEditable: true,
      insideVisualizer: true,
    }),
    false,
  );
});

test("visualizer shortcuts do not steal scrolling or keys outside the visualizer", () => {
  assert.equal(
    shouldHandleVisualizerShortcut({
      key: " ",
      tagName: "BODY",
      isContentEditable: false,
      insideVisualizer: false,
    }),
    false,
  );
});

test("visualizer shortcuts accept only the three playback keys on noninteractive content", () => {
  const base = {
    tagName: "DIV",
    isContentEditable: false,
    insideVisualizer: true,
  };

  assert.equal(shouldHandleVisualizerShortcut({ ...base, key: "ArrowLeft" }), true);
  assert.equal(shouldHandleVisualizerShortcut({ ...base, key: "ArrowRight" }), true);
  assert.equal(shouldHandleVisualizerShortcut({ ...base, key: " " }), true);
  assert.equal(shouldHandleVisualizerShortcut({ ...base, key: "Enter" }), false);
});

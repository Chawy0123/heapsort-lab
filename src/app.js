import {
  generateHeapSortSteps,
  isMaxHeap,
  parseIntegerList,
} from "./heap-sort.js";
import { createPlaybackController } from "./playback-controller.js";
import { shouldHandleVisualizerShortcut } from "./keyboard-shortcuts.js";
import {
  createArrayModel,
  createHistoryEntries,
  createTreeModel,
  getVisualizationMetrics,
  phaseLabel,
} from "./view-model.js";

const DEFAULT_VALUES = [4, 10, 3, 5, 1];
const SVG_NS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);

const elements = {
  form: $("data-form"),
  input: $("data-input"),
  inputError: $("input-error"),
  apply: $("apply-data"),
  random: $("random-data"),
  reset: $("reset-sort"),
  build: $("build-heap"),
  previous: $("prev-step"),
  next: $("next-step"),
  autoPlay: $("auto-play"),
  autoPlayLabel: $("auto-play")?.querySelector("span"),
  tree: $("heap-tree"),
  array: $("array-view"),
  message: $("step-message"),
  comparisons: $("comparison-count"),
  swaps: $("swap-count"),
  heapSize: $("heap-size"),
  extracted: $("extracted-values"),
  history: $("history-list"),
  phase: $("current-phase"),
  progress: $("progress-bar"),
  stepCounter: $("step-counter"),
  heapStatus: $("heap-status"),
};

let initialValues = [...DEFAULT_VALUES];
let currentRun = generateHeapSortSteps(initialValues);

const controller = createPlaybackController({
  steps: currentRun.steps,
  onChange: ({ index }) => renderStep(index),
});

function svgElement(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function renderArray(step) {
  const model = createArrayModel(step);
  const metrics = getVisualizationMetrics(step.array);
  const fragment = document.createDocumentFragment();
  elements.array.style.setProperty("--cell-width", `${metrics.arrayCellWidth}px`);

  for (const cell of model.cells) {
    if (cell.index === model.boundaryIndex && model.boundaryIndex > 0) {
      const boundary = document.createElement("span");
      boundary.className = "heap-boundary";
      boundary.setAttribute("aria-label", "堆積區與已排序區分界");
      fragment.append(boundary);
    }

    const item = document.createElement("span");
    item.className = `array-cell is-${cell.state}`;
    item.dataset.index = String(cell.index);

    const index = document.createElement("span");
    index.className = "index";
    index.textContent = String(cell.index);

    const value = document.createElement("span");
    value.className = "value";
    value.textContent = String(cell.value);

    item.append(index, value);
    fragment.append(item);
  }

  elements.array.replaceChildren(fragment);
}

function renderTree(step) {
  const metrics = getVisualizationMetrics(step.array);
  const width = metrics.treeWidth;
  const height = metrics.treeHeight;
  const model = createTreeModel(step, width, height);
  const fragment = document.createDocumentFragment();
  elements.tree.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.tree.style.width = `${width}px`;
  elements.tree.style.height = `${height}px`;

  for (const edge of model.edges) {
    const parent = model.nodes[edge.parentIndex];
    const child = model.nodes[edge.childIndex];
    fragment.append(
      svgElement("line", {
        x1: parent.x,
        y1: parent.y,
        x2: child.x,
        y2: child.y,
        class: `tree-edge is-${child.state}`,
      }),
    );
  }

  for (const node of model.nodes) {
    const group = svgElement("g", {
      class: `tree-node is-${node.state}`,
      transform: `translate(${node.x} ${node.y})`,
      role: "img",
      "aria-label": `索引 ${node.index}，值 ${node.value}，${node.state}`,
    });
    const circle = svgElement("circle", {
      cx: 0,
      cy: 0,
      r: metrics.nodeRadius,
    });
    const value = svgElement("text", {
      x: 0,
      y: 6,
      "text-anchor": "middle",
      class: "node-value",
    });
    value.textContent = String(node.value);
    const index = svgElement("text", {
      x: 0,
      y: metrics.nodeRadius + 16,
      "text-anchor": "middle",
      class: "node-index",
    });
    index.textContent = String(node.index);
    group.append(circle, value, index);
    fragment.append(group);
  }

  elements.tree.replaceChildren(fragment);
  if (step.phase === "initial") {
    const scroller = elements.tree.parentElement;
    scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
  }
}

function renderHistory(index) {
  const entries = createHistoryEntries(currentRun.steps, index);
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "還沒有執行紀錄。";
    elements.history.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const entry of entries) {
    const item = document.createElement("li");
    const label = document.createElement("b");
    label.textContent = `${entry.label}：`;
    const message = document.createElement("span");
    message.textContent = entry.message;
    item.append(label, message);
    fragment.append(item);
  }
  elements.history.replaceChildren(fragment);
  elements.history.scrollTop = elements.history.scrollHeight;
}

export function renderStep(index) {
  const step = currentRun.steps[index];
  if (!step) return;

  renderTree(step);
  renderArray(step);
  renderHistory(index);

  elements.message.textContent = step.message;
  elements.comparisons.textContent = String(step.comparisons);
  elements.swaps.textContent = String(step.swaps);
  elements.heapSize.textContent = String(step.heapSize);
  elements.extracted.textContent = step.extractedMaxima.length
    ? step.extractedMaxima.join(" → ")
    : "尚未取出";
  elements.phase.textContent = phaseLabel(step.phase);
  elements.stepCounter.textContent = `${index} / ${currentRun.steps.length - 1}`;
  elements.progress.style.width = `${(index / (currentRun.steps.length - 1)) * 100}%`;

  const buildIndex = currentRun.steps.findIndex(
    (candidate) => candidate.phase === "build-complete",
  );
  const built = step.phase === "build-complete" || (index > buildIndex && step.heapSize > 0);
  const validHeap = built && isMaxHeap(step.array, step.heapSize);
  elements.heapStatus.textContent = step.phase === "complete"
    ? "排序完成"
    : validHeap
      ? "Max-Heap 合法"
      : step.phase === "initial"
        ? "等待建堆"
        : "調整中";
  elements.heapStatus.classList.toggle("is-valid", validHeap || step.phase === "complete");

  const state = controller.getState();
  elements.previous.disabled = index === 0;
  elements.next.disabled = index >= currentRun.steps.length - 1;
  elements.autoPlay.setAttribute("aria-pressed", String(state.playing));
  elements.autoPlay.classList.toggle("is-playing", state.playing);
  elements.autoPlayLabel.textContent = state.playing ? "暫停" : "自動排序";
}

export function stopAutoPlay() {
  return controller.stopAutoPlay();
}

export function startAutoPlay() {
  const state = controller.getState();
  if (state.index >= state.total - 1) controller.load(currentRun.steps);
  return controller.startAutoPlay();
}

function clearInputError() {
  elements.input.removeAttribute("aria-invalid");
  elements.inputError.textContent = "";
}

function showInputError(message) {
  elements.input.setAttribute("aria-invalid", "true");
  elements.inputError.textContent = message;
  elements.input.focus();
}

export function loadValues(values) {
  stopAutoPlay();
  initialValues = [...values];
  currentRun = generateHeapSortSteps(initialValues);
  elements.input.value = initialValues.join(", ");
  clearInputError();
  controller.load(currentRun.steps);
}

function jumpToBuildComplete() {
  stopAutoPlay();
  const target = currentRun.steps.findIndex((step) => step.phase === "build-complete");
  if (controller.getState().index > target) controller.load(currentRun.steps);
  while (controller.getState().index < target) controller.next();
}

function applyInput() {
  const parsed = parseIntegerList(elements.input.value);
  if (!parsed.ok) {
    showInputError(parsed.error);
    return;
  }
  loadValues(parsed.values);
}

function randomValues() {
  const length = 6 + Math.floor(Math.random() * 3);
  return Array.from({ length }, () => Math.floor(Math.random() * 70) - 20);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  applyInput();
});
elements.input.addEventListener("input", clearInputError);
elements.random.addEventListener("click", () => loadValues(randomValues()));
elements.reset.addEventListener("click", () => loadValues(initialValues));
elements.build.addEventListener("click", jumpToBuildComplete);
elements.previous.addEventListener("click", () => controller.previous());
elements.next.addEventListener("click", () => {
  stopAutoPlay();
  controller.next();
});
elements.autoPlay.addEventListener("click", () => {
  if (controller.getState().playing) stopAutoPlay();
  else startAutoPlay();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const insideVisualizer = target instanceof Node && $("visualizer").contains(target);
  if (!shouldHandleVisualizerShortcut({
    key: event.key,
    tagName: target?.tagName ?? "",
    isContentEditable: Boolean(target?.isContentEditable),
    insideVisualizer,
  })) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    stopAutoPlay();
    controller.next();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    controller.previous();
  } else if (event.key === " ") {
    event.preventDefault();
    if (controller.getState().playing) stopAutoPlay();
    else startAutoPlay();
  }
});

renderStep(0);

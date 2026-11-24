import test from "node:test";
import assert from "node:assert/strict";

import {
  createArrayModel,
  createHistoryEntries,
  createTreeModel,
  getVisualizationMetrics,
  phaseLabel,
} from "../src/view-model.js";

const step = {
  array: [5, 4, 3, 1, 10],
  heapSize: 4,
  phase: "extract",
  compareIndices: [1, 2],
  swapIndices: [0, 4],
  extractedMaxima: [10],
};

test("createArrayModel marks heap, compared, swapped, and sorted cells", () => {
  const model = createArrayModel(step);

  assert.equal(model.boundaryIndex, 4);
  assert.deepEqual(
    model.cells.map(({ index, value, state }) => ({ index, value, state })),
    [
      { index: 0, value: 5, state: "swap" },
      { index: 1, value: 4, state: "compare" },
      { index: 2, value: 3, state: "compare" },
      { index: 3, value: 1, state: "heap" },
      { index: 4, value: 10, state: "sorted" },
    ],
  );
});

test("createTreeModel maps array indices to parent edges and stable coordinates", () => {
  const model = createTreeModel(step, 680, 310);

  assert.equal(model.nodes.length, 5);
  assert.deepEqual(
    model.edges.map(({ parentIndex, childIndex }) => [parentIndex, childIndex]),
    [[0, 1], [0, 2], [1, 3], [1, 4]],
  );
  assert.deepEqual(model.nodes[0], {
    index: 0,
    value: 5,
    x: 340,
    y: 42,
    state: "swap",
  });
  assert.equal(model.nodes[4].state, "sorted");
  assert.ok(model.nodes.every((node) => node.x >= 24 && node.x <= 656));
});

test("createHistoryEntries keeps meaningful milestones through the current index", () => {
  const steps = [
    { phase: "initial", message: "原始資料" },
    { phase: "build", message: "建堆中" },
    { phase: "build-complete", message: "最大堆積完成" },
    { phase: "extract", message: "取出 10" },
    { phase: "compare", message: "比較" },
    { phase: "extract", message: "取出 5" },
    { phase: "complete", message: "排序完成" },
  ];

  assert.deepEqual(createHistoryEntries(steps, 5), [
    { label: "開始", message: "原始資料" },
    { label: "建堆完成", message: "最大堆積完成" },
    { label: "取出最大值", message: "取出 10" },
    { label: "取出最大值", message: "取出 5" },
  ]);
});

test("phaseLabel presents every playback stage in Traditional Chinese", () => {
  assert.equal(phaseLabel("initial"), "準備資料");
  assert.equal(phaseLabel("build-complete"), "最大堆積完成");
  assert.equal(phaseLabel("extract"), "取出最大值");
  assert.equal(phaseLabel("complete"), "排序完成");
});

test("visualization metrics expand for twelve long safe integers without shrinking labels", () => {
  const values = [
    9007199254740991,
    -9007199254740991,
    123456789012345,
    -234567890123456,
    345678901234567,
    -456789012345678,
    567890123456789,
    -678901234567890,
    789012345678901,
    -890123456789012,
    901234567890123,
    -123456789012345,
  ];
  const metrics = getVisualizationMetrics(values);

  assert.equal(metrics.maxDigits, 17);
  assert.ok(metrics.arrayCellWidth >= 194);
  assert.ok(metrics.nodeRadius >= 99);
  assert.ok(metrics.treeWidth > 1600);
  assert.ok(metrics.treeHeight > 700);
});

test("visualization metrics preserve the compact classroom layout for short values", () => {
  assert.deepEqual(getVisualizationMetrics([4, 10, 3, 5, 1]), {
    maxDigits: 2,
    arrayCellWidth: 58,
    nodeRadius: 23,
    treeWidth: 680,
    treeHeight: 310,
  });
});

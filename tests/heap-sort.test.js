import test from "node:test";
import assert from "node:assert/strict";

import {
  generateHeapSortSteps,
  isMaxHeap,
  parseIntegerList,
} from "../src/heap-sort.js";

test("parseIntegerList accepts comma, Chinese comma, and whitespace separators", () => {
  assert.deepEqual(parseIntegerList("4, 10，3  5\n1"), {
    ok: true,
    values: [4, 10, 3, 5, 1],
  });
});

test("parseIntegerList preserves negative integers and zero", () => {
  assert.deepEqual(parseIntegerList("-8, 0, 3, -1"), {
    ok: true,
    values: [-8, 0, 3, -1],
  });
});

test("parseIntegerList rejects a non-integer token instead of discarding it", () => {
  assert.deepEqual(parseIntegerList("4, ten, 3"), {
    ok: false,
    error: "請只輸入整數，並以逗號或空白分隔。",
  });
});

test("parseIntegerList rejects fewer than two integers", () => {
  assert.deepEqual(parseIntegerList("42"), {
    ok: false,
    error: "請至少輸入 2 個整數。",
  });
});

test("parseIntegerList rejects more than twelve integers", () => {
  assert.deepEqual(parseIntegerList("1 2 3 4 5 6 7 8 9 10 11 12 13"), {
    ok: false,
    error: "最多只能輸入 12 個整數。",
  });
});

const sortingCases = [
  { name: "一般亂序", input: [4, 10, 3, 5, 1], expected: [1, 3, 4, 5, 10] },
  { name: "已經排好", input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
  { name: "完全反向", input: [5, 4, 3, 2, 1], expected: [1, 2, 3, 4, 5] },
  { name: "重複值", input: [4, 2, 4, 1, 2], expected: [1, 2, 2, 4, 4] },
  { name: "負數與零", input: [0, -5, 3, -1, 3], expected: [-5, -1, 0, 3, 3] },
  { name: "兩個元素", input: [9, -2], expected: [-2, 9] },
];

for (const { name, input, expected } of sortingCases) {
  test(`generateHeapSortSteps sorts ${name} without losing values`, () => {
    const original = [...input];
    const run = generateHeapSortSteps(input);

    assert.deepEqual(run.result, expected);
    assert.deepEqual(input, original, "不得修改呼叫端的原始陣列");
    assert.deepEqual([...run.result].sort((a, b) => a - b), expected);
  });
}

test("generateHeapSortSteps extracts the current maximum in every round", () => {
  const input = [4, 10, 3, 5, 1];
  const { steps, extractedMaxima } = generateHeapSortSteps(input);
  const extractionSteps = steps
    .map((step, index) => ({ step, previous: steps[index - 1] }))
    .filter(({ step }) => step.phase === "extract");

  assert.deepEqual(extractedMaxima, [10, 5, 4, 3]);
  assert.equal(extractionSteps.length, input.length - 1);

  for (const { step, previous } of extractionSteps) {
    const previousMaximum = Math.max(
      ...previous.array.slice(0, previous.heapSize),
    );
    assert.equal(step.heapSize, previous.heapSize - 1);
    assert.equal(step.array[step.heapSize], previousMaximum);
    assert.equal(
      step.extractedMaxima.at(-1),
      previousMaximum,
      "取出紀錄必須與移入已排序區的值一致",
    );
  }
});

test("build completion is a valid max heap before extraction begins", () => {
  const { steps } = generateHeapSortSteps([4, 10, 3, 5, 1]);
  const built = steps.find((step) => step.phase === "build-complete");

  assert.ok(built, "必須產生建堆完成快照");
  assert.equal(isMaxHeap(built.array, built.heapSize), true);
  assert.deepEqual(built.array, [10, 5, 3, 4, 1]);
});

test("all snapshots carry immutable playback fields", () => {
  const { steps } = generateHeapSortSteps([3, 1, 2]);

  for (const step of steps) {
    assert.ok(Array.isArray(step.array));
    assert.ok(Array.isArray(step.compareIndices));
    assert.ok(Array.isArray(step.swapIndices));
    assert.ok(Array.isArray(step.extractedMaxima));
    assert.equal(typeof step.heapSize, "number");
    assert.equal(typeof step.phase, "string");
    assert.equal(typeof step.message, "string");
    assert.equal(typeof step.comparisons, "number");
    assert.equal(typeof step.swaps, "number");
    assert.equal(Object.isFrozen(step), true);
    assert.equal(Object.isFrozen(step.array), true);
  }
});

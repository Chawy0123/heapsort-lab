import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const requiredIds = [
  "data-input",
  "apply-data",
  "random-data",
  "reset-sort",
  "prev-step",
  "next-step",
  "auto-play",
  "heap-tree",
  "array-view",
  "step-message",
  "comparison-count",
  "swap-count",
  "heap-size",
  "extracted-values",
  "history-list",
];

async function loadPage() {
  return readFile(new URL("../index.html", import.meta.url), "utf8");
}

test("the page exposes every stable hook required by the interactive renderer", async () => {
  const html = await loadPage();

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `缺少 #${id}`);
  }
});

test("the page covers the four graded educational sections", async () => {
  const html = await loadPage();

  for (const heading of ["互動展示", "排序原理", "複雜度比較", "學習心得"]) {
    assert.match(html, new RegExp(heading));
  }
  assert.match(html, /最大值取出紀錄/);
  assert.match(html, /JavaScript 核心程式/);
});

test("the complexity comparison states the correct best average and worst cases", async () => {
  const html = await loadPage();

  assert.match(html, /Heap Sort/);
  assert.match(html, /Bubble Sort/);
  assert.match(html, /O\(n log n\)/);
  assert.match(html, /O\(n²\)/);
  assert.match(html, /提前終止/);
  assert.match(html, /不穩定/);
  assert.match(html, /穩定/);
});

test("the reflection records concrete implementation lessons instead of generic filler", async () => {
  const html = await loadPage();

  assert.match(html, /建堆與正式排序/);
  assert.match(html, /heapSize/);
  assert.match(html, /2i \+ 1/);
  assert.match(html, /Bubble Sort/);
  assert.match(html, /特殊資料/);
});

test("the document declares a real favicon so browsers do not request a missing default", async () => {
  const html = await loadPage();

  assert.match(html, /<link[^>]+rel=["']icon["'][^>]+href=["']favicon\.svg["']/);
  await access(new URL("../favicon.svg", import.meta.url));
});

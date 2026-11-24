/**
 * Convert a classroom-friendly integer list into validated numeric data.
 *
 * @param {string} text
 * @returns {{ok: true, values: number[]} | {ok: false, error: string}}
 */
export function parseIntegerList(text) {
  const normalized = String(text ?? "").trim();
  const tokens = normalized ? normalized.split(/[,，\s]+/) : [];

  if (tokens.some((token) => !/^-?\d+$/.test(token))) {
    return { ok: false, error: "請只輸入整數，並以逗號或空白分隔。" };
  }

  const values = tokens.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value))) {
    return {
      ok: false,
      error: "整數必須介於 -9007199254740991 與 9007199254740991 之間。",
    };
  }
  if (values.length < 2) {
    return { ok: false, error: "請至少輸入 2 個整數。" };
  }
  if (values.length > 12) {
    return { ok: false, error: "最多只能輸入 12 個整數。" };
  }

  return { ok: true, values };
}

/**
 * Check whether the active prefix follows the Max-Heap property.
 *
 * @param {number[]} values
 * @param {number} heapSize
 * @returns {boolean}
 */
export function isMaxHeap(values, heapSize) {
  for (let child = 1; child < heapSize; child += 1) {
    const parent = Math.floor((child - 1) / 2);
    if (values[parent] < values[child]) return false;
  }
  return true;
}

/**
 * Produce immutable snapshots for a complete in-place Heap Sort playback.
 *
 * @param {number[]} values
 * @returns {{steps: object[], result: number[], extractedMaxima: number[]}}
 */
export function generateHeapSortSteps(values) {
  const array = [...values];
  const extractedMaxima = [];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  let heapSize = array.length;

  function snapshot({
    phase,
    message,
    compareIndices = [],
    swapIndices = [],
  }) {
    const step = {
      array: Object.freeze([...array]),
      heapSize,
      phase,
      message,
      compareIndices: Object.freeze([...compareIndices]),
      swapIndices: Object.freeze([...swapIndices]),
      comparisons,
      swaps,
      extractedMaxima: Object.freeze([...extractedMaxima]),
    };
    steps.push(Object.freeze(step));
  }

  function compare(left, right, phase = "compare") {
    comparisons += 1;
    snapshot({
      phase,
      message: `比較索引 ${left} 的 ${array[left]} 與索引 ${right} 的 ${array[right]}。`,
      compareIndices: [left, right],
    });
    return array[left] < array[right];
  }

  function exchange(left, right, phase = "swap") {
    [array[left], array[right]] = [array[right], array[left]];
    swaps += 1;
    snapshot({
      phase,
      message: `交換索引 ${left} 與索引 ${right}，讓較大的值往堆頂移動。`,
      swapIndices: [left, right],
    });
  }

  function siftDown(start, limit) {
    let root = start;
    snapshot({
      phase: "sift-down",
      message: `從索引 ${root} 開始向下調整，範圍只到索引 ${limit - 1}。`,
      compareIndices: [root],
    });

    while (true) {
      const left = root * 2 + 1;
      const right = left + 1;
      let largest = root;

      if (left < limit && compare(largest, left)) largest = left;
      if (right < limit && compare(largest, right)) largest = right;
      if (largest === root) return;

      exchange(root, largest);
      root = largest;
    }
  }

  snapshot({
    phase: "initial",
    message: "先觀察原始陣列，接著從最後一個有子節點的位置開始建堆。",
  });

  for (let index = Math.floor(array.length / 2) - 1; index >= 0; index -= 1) {
    snapshot({
      phase: "build",
      message: `建堆：將索引 ${index} 當作根節點進行向下調整。`,
      compareIndices: [index],
    });
    siftDown(index, heapSize);
  }

  snapshot({
    phase: "build-complete",
    message: `最大堆積建立完成，堆頂 ${array[0]} 是目前最大值。`,
    compareIndices: [0],
  });

  for (let end = array.length - 1; end > 0; end -= 1) {
    snapshot({
      phase: "extract-ready",
      message: `準備取出堆頂 ${array[0]}，放到堆積區最後的索引 ${end}。`,
      swapIndices: [0, end],
    });

    const maximum = array[0];
    [array[0], array[end]] = [array[end], array[0]];
    swaps += 1;
    heapSize = end;
    extractedMaxima.push(maximum);
    snapshot({
      phase: "extract",
      message: `取出最大值 ${maximum}；它已進入已排序區，不再參與後續調整。`,
      swapIndices: [0, end],
    });

    siftDown(0, heapSize);
  }

  heapSize = 0;
  snapshot({
    phase: "complete",
    message: `排序完成：${array.join("、")}。`,
  });

  return {
    steps: Object.freeze(steps),
    result: Object.freeze([...array]),
    extractedMaxima: Object.freeze([...extractedMaxima]),
  };
}

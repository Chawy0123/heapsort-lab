const PHASE_LABELS = {
  initial: "準備資料",
  build: "建立最大堆積",
  "sift-down": "向下調整",
  compare: "比較節點",
  swap: "交換節點",
  "build-complete": "最大堆積完成",
  "extract-ready": "準備取出最大值",
  extract: "取出最大值",
  complete: "排序完成",
};

export function phaseLabel(phase) {
  return PHASE_LABELS[phase] ?? "排序進行中";
}

function stateForIndex(step, index) {
  if (index >= step.heapSize) return "sorted";
  if (step.swapIndices.includes(index)) return "swap";
  if (step.compareIndices.includes(index)) return "compare";
  return "heap";
}

export function createArrayModel(step) {
  return {
    boundaryIndex: step.heapSize,
    cells: step.array.map((value, index) => ({
      index,
      value,
      state: stateForIndex(step, index),
    })),
  };
}

export function createTreeModel(step, width = 680, height = 310) {
  const marginX = 24;
  const rootY = 42;
  const maxDepth = Math.max(0, Math.floor(Math.log2(step.array.length)));
  const depthGap = maxDepth ? (height - rootY - 42) / maxDepth : 0;

  const nodes = step.array.map((value, index) => {
    const depth = Math.floor(Math.log2(index + 1));
    const firstAtDepth = 2 ** depth - 1;
    const position = index - firstAtDepth;
    const slots = 2 ** depth;
    const x = marginX + ((width - marginX * 2) * (position + 0.5)) / slots;

    return {
      index,
      value,
      x,
      y: rootY + depth * depthGap,
      state: stateForIndex(step, index),
    };
  });

  const edges = nodes.slice(1).map((node) => ({
    parentIndex: Math.floor((node.index - 1) / 2),
    childIndex: node.index,
  }));

  return { nodes, edges };
}

export function createHistoryEntries(steps, currentIndex) {
  const milestones = new Set(["initial", "build-complete", "extract", "complete"]);

  return steps
    .slice(0, currentIndex + 1)
    .filter((step) => milestones.has(step.phase))
    .map((step) => ({
      label:
        step.phase === "initial"
          ? "開始"
          : step.phase === "build-complete"
            ? "建堆完成"
            : phaseLabel(step.phase),
      message: step.message,
    }));
}

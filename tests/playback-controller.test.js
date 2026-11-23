import test from "node:test";
import assert from "node:assert/strict";

import { createPlaybackController } from "../src/playback-controller.js";

function makeSteps(length) {
  return Array.from({ length }, (_, index) => ({ index }));
}

function createManualClock() {
  const callbacks = new Map();
  let nextId = 1;
  let scheduled = 0;

  return {
    schedule(callback, delay) {
      assert.equal(delay, 850);
      const id = nextId;
      nextId += 1;
      scheduled += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancel(id) {
      callbacks.delete(id);
    },
    tick() {
      for (const callback of [...callbacks.values()]) callback();
    },
    activeCount() {
      return callbacks.size;
    },
    scheduledCount() {
      return scheduled;
    },
  };
}

test("load resets playback position, timer state, and published snapshot", () => {
  const clock = createManualClock();
  const published = [];
  const controller = createPlaybackController({
    steps: makeSteps(4),
    schedule: clock.schedule,
    cancel: clock.cancel,
    onChange: (state) => published.push(state),
  });

  controller.next();
  controller.startAutoPlay();
  controller.load(makeSteps(3));

  assert.deepEqual(controller.getState(), {
    index: 0,
    total: 3,
    playing: false,
    step: { index: 0 },
  });
  assert.equal(clock.activeCount(), 0);
  assert.deepEqual(published.at(-1), controller.getState());
});

test("previous and next clamp to the available snapshot range", () => {
  const controller = createPlaybackController({ steps: makeSteps(3) });

  controller.previous();
  assert.equal(controller.getState().index, 0);
  controller.next();
  controller.next();
  controller.next();
  assert.equal(controller.getState().index, 2);
  controller.previous();
  assert.equal(controller.getState().index, 1);
});

test("starting auto-play twice schedules exactly one 850ms timer", () => {
  const clock = createManualClock();
  const controller = createPlaybackController({
    steps: makeSteps(4),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  assert.equal(controller.startAutoPlay(), true);
  assert.equal(controller.startAutoPlay(), false);
  assert.equal(clock.scheduledCount(), 1);
  assert.equal(clock.activeCount(), 1);
  assert.equal(controller.getState().playing, true);

  clock.tick();
  assert.equal(controller.getState().index, 1);
});

test("auto-play stops itself when it reaches the final snapshot", () => {
  const clock = createManualClock();
  const controller = createPlaybackController({
    steps: makeSteps(2),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  controller.startAutoPlay();
  clock.tick();

  assert.deepEqual(controller.getState(), {
    index: 1,
    total: 2,
    playing: false,
    step: { index: 1 },
  });
  assert.equal(clock.activeCount(), 0);
});

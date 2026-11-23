/**
 * Keep playback timing separate from DOM rendering so navigation and timer
 * rules stay deterministic and testable.
 */
export function createPlaybackController({
  steps = [],
  schedule = (callback, delay) => setInterval(callback, delay),
  cancel = (timerId) => clearInterval(timerId),
  onChange = () => {},
} = {}) {
  let snapshots = [...steps];
  let index = 0;
  let timerId = null;

  function getState() {
    return {
      index,
      total: snapshots.length,
      playing: timerId !== null,
      step: snapshots[index] ?? null,
    };
  }

  function publish() {
    onChange(getState());
  }

  function stopAutoPlay() {
    if (timerId === null) return false;
    cancel(timerId);
    timerId = null;
    publish();
    return true;
  }

  function load(nextSteps) {
    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }
    snapshots = [...nextSteps];
    index = 0;
    publish();
  }

  function previous() {
    if (timerId !== null) stopAutoPlay();
    index = Math.max(0, index - 1);
    publish();
  }

  function next() {
    index = Math.min(Math.max(0, snapshots.length - 1), index + 1);
    if (index >= snapshots.length - 1 && timerId !== null) {
      cancel(timerId);
      timerId = null;
    }
    publish();
  }

  function startAutoPlay() {
    if (timerId !== null || snapshots.length < 2 || index >= snapshots.length - 1) {
      return false;
    }
    timerId = schedule(next, 850);
    publish();
    return true;
  }

  return {
    getState,
    load,
    next,
    previous,
    startAutoPlay,
    stopAutoPlay,
  };
}

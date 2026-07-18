"use strict";

const STAGES = [
  {
    kicker: "Key I · Intake",
    title: "The plausible key",
    brief: "A reassuringly normal key for a suspiciously well-documented door.",
    keyName: "plausible brass key",
    lockName: "door lock L–01",
    lockCode: "L–01",
    issuedCode: "ISSUED · I",
  },
  {
    kicker: "Key II · Escalation",
    title: "The questionable key",
    brief: "A jointed key retrieved from the drawer it apparently just unlocked.",
    keyName: "questionable jointed key",
    lockName: "drawer lock L–02",
    lockCode: "L–02",
    issuedCode: "ISSUED · II",
  },
  {
    kicker: "Key III · Final-ish review",
    title: "The administrative key",
    brief: "An impossible key for a door too small to justify this much paperwork.",
    keyName: "administrative impossible key",
    lockName: "small-door lock L–03",
    lockCode: "L–03",
    issuedCode: "ISSUED · III",
  },
];

const ANOMALIES = [
  {
    id: "lock-moves",
    message: "The lock has relocated during processing.",
    status: "Lock moved. Its forwarding address is temporary.",
    sound: "slide",
    duration: 1080,
  },
  {
    id: "key-bends",
    message: "The key has adopted a more flexible policy.",
    status: "Key bent. Structural confidence remains officially high.",
    sound: "bend",
    duration: 1050,
  },
  {
    id: "door-shifts",
    message: "The door has changed its registered position.",
    status: "Door position changed. The floor plan has not been informed.",
    sound: "slide",
    duration: 1100,
  },
  {
    id: "lock-rejects",
    message: "The lock rejects the key on procedural grounds.",
    status: "Rejected, then logged as conditional approval.",
    sound: "reject",
    duration: 980,
  },
  {
    id: "key-duplicates",
    message: "The key has generated an unauthorized colleague.",
    status: "Duplicate key detected. Neither copy accepts responsibility.",
    sound: "duplicate",
    duration: 1220,
  },
  {
    id: "door-rotates",
    message: "The door rotates to improve compliance.",
    status: "Door rotated. Accessibility of the opening remains theoretical.",
    sound: "rotate",
    duration: 1180,
  },
  {
    id: "key-self-unlocks",
    message: "The key has unlocked itself.",
    status: "Key self-unlocked. No one remembers locking it.",
    sound: "self",
    duration: 1040,
  },
  {
    id: "thief-steals",
    message: "A tiny subcontractor steals the key.",
    status: "Key stolen and returned. The subcontractor kept no receipts.",
    sound: "thief",
    duration: 1480,
  },
];

// Eight anomalies are shuffled into six drops. Two drops receive a double incident.
const ANOMALIES_PER_DROP = [1, 1, 2, 1, 1, 2];
const ATTEMPTS_PER_STAGE = 2;

const elements = {
  board: document.querySelector("#puzzleBoard"),
  key: document.querySelector("#keyToken"),
  lock: document.querySelector("#lockTarget"),
  lockLabel: document.querySelector("#lockTarget .lock-label"),
  stageKicker: document.querySelector("#stageKicker"),
  stageTitle: document.querySelector("#stageTitle"),
  stageBrief: document.querySelector("#stageBrief"),
  attemptLabel: document.querySelector("#attemptLabel"),
  attemptPips: [...document.querySelectorAll(".attempt-pips i")],
  progressCount: document.querySelector("#progressCount"),
  stageItems: [...document.querySelectorAll("#stageList li")],
  eventFeed: document.querySelector("#eventFeed"),
  eventBanner: document.querySelector("#eventBanner"),
  eventMessage: document.querySelector("#eventMessage"),
  liveStatus: document.querySelector("#liveStatus"),
  statusLight: document.querySelector(".status-light"),
  soundToggle: document.querySelector("#soundToggle"),
  soundLabel: document.querySelector("#soundToggle .control-label"),
  soundIcon: document.querySelector("#soundToggle .sound-icon"),
  resetButton: document.querySelector("#resetButton"),
  finalReset: document.querySelector("#finalReset"),
  finalReveal: document.querySelector("#finalReveal"),
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let drag = null;
let runId = 0;

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function createState() {
  return {
    stage: 0,
    attempts: 0,
    anomalyIndex: 0,
    dropIndex: 0,
    anomalyQueue: shuffled(ANOMALIES),
    keyOffset: { x: 0, y: 0 },
    busy: false,
    complete: false,
  };
}

let state = createState();

class SoundEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.enabled) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") this.context.resume().catch(() => {});
    return this.context;
  }

  tone(frequency, duration = 0.1, type = "sine", volume = 0.04, delay = 0) {
    const context = this.ensureContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  play(name) {
    if (!this.enabled) return;
    const patterns = {
      pickup: [[240, 0.06, "square", 0.025, 0]],
      drop: [[92, 0.1, "triangle", 0.06, 0], [140, 0.08, "square", 0.02, 0.05]],
      slide: [[130, 0.16, "sawtooth", 0.025, 0], [108, 0.2, "sawtooth", 0.018, 0.12]],
      bend: [[280, 0.14, "triangle", 0.035, 0], [205, 0.22, "triangle", 0.03, 0.08]],
      reject: [[95, 0.13, "square", 0.045, 0], [73, 0.2, "square", 0.04, 0.15]],
      duplicate: [[330, 0.1, "sine", 0.035, 0], [495, 0.11, "sine", 0.03, 0.08]],
      rotate: [[165, 0.3, "triangle", 0.025, 0], [185, 0.25, "triangle", 0.022, 0.16]],
      self: [[392, 0.1, "sine", 0.035, 0], [523, 0.12, "sine", 0.035, 0.09], [659, 0.18, "sine", 0.03, 0.18]],
      thief: [[720, 0.05, "square", 0.02, 0], [620, 0.05, "square", 0.02, 0.1], [760, 0.05, "square", 0.02, 0.2]],
      success: [[262, 0.12, "sine", 0.04, 0], [392, 0.16, "sine", 0.04, 0.12], [523, 0.22, "sine", 0.04, 0.24]],
      final: [[196, 0.2, "triangle", 0.04, 0], [294, 0.25, "triangle", 0.04, 0.16], [392, 0.3, "triangle", 0.04, 0.34], [370, 0.5, "sawtooth", 0.025, 0.62]],
      reset: [[260, 0.08, "square", 0.025, 0], [180, 0.1, "square", 0.02, 0.07]],
    };

    (patterns[name] || []).forEach((tone) => this.tone(...tone));
  }
}

const sound = new SoundEngine();

function wait(milliseconds) {
  const duration = reducedMotion.matches ? Math.min(milliseconds, 70) : milliseconds;
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function setStatus(message, busy = state.busy) {
  elements.liveStatus.textContent = message;
  elements.statusLight.classList.toggle("is-busy", busy);
}

function addLedgerEntry(message) {
  const item = document.createElement("li");
  item.textContent = message;
  elements.eventFeed.prepend(item);

  while (elements.eventFeed.children.length > 4) {
    elements.eventFeed.lastElementChild.remove();
  }
}

function updateProgress() {
  const completedStages = state.complete ? STAGES.length : state.stage;
  elements.progressCount.textContent = `${completedStages} / ${STAGES.length}`;

  elements.stageItems.forEach((item, index) => {
    const isComplete = state.complete || index < state.stage;
    const isCurrent = !state.complete && index === state.stage;
    item.classList.toggle("is-complete", isComplete);
    item.classList.toggle("is-current", isCurrent);
    if (isCurrent) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function updateAttempts() {
  elements.attemptLabel.textContent = `Test ${state.attempts} of ${ATTEMPTS_PER_STAGE}`;
  elements.attemptPips.forEach((pip, index) => {
    pip.classList.toggle("is-filled", index < state.attempts);
  });
}

function setKeyOffset(x, y) {
  state.keyOffset = { x, y };
  elements.key.style.setProperty("--drag-x", `${x}px`);
  elements.key.style.setProperty("--drag-y", `${y}px`);
}

function resetKeyPosition() {
  elements.key.classList.remove("is-dragging");
  setKeyOffset(0, 0);
}

function clearBoardClasses() {
  [...elements.board.classList].forEach((className) => {
    if (className !== "puzzle-board") elements.board.classList.remove(className);
  });
}

function renderStage({ announce = true } = {}) {
  const stage = STAGES[state.stage];
  state.busy = false;
  clearBoardClasses();
  elements.board.dataset.stage = String(state.stage + 1);
  elements.stageKicker.textContent = stage.kicker;
  elements.stageTitle.textContent = stage.title;
  elements.stageBrief.textContent = stage.brief;
  elements.lockLabel.textContent = stage.lockCode;
  elements.lock.setAttribute("aria-label", `Target: ${stage.lockName}`);
  elements.key.setAttribute(
    "aria-label",
    `${stage.keyName}. Drag it to ${stage.lockName}, use arrow keys to move it, or press Enter to test it.`,
  );
  elements.key.querySelector(".key-tag").textContent = stage.issuedCode;
  elements.key.setAttribute("aria-disabled", "false");
  elements.finalReveal.setAttribute("aria-hidden", "true");
  elements.finalReveal.setAttribute("inert", "");
  resetKeyPosition();
  updateAttempts();
  updateProgress();
  if (announce) setStatus(`${stage.title} ready. Drag it into ${stage.lockName}.`, false);
}

function clampKeyMove(deltaX, deltaY) {
  const keyRect = elements.key.getBoundingClientRect();
  const boardRect = elements.board.getBoundingClientRect();
  const horizontal = Math.min(Math.max(deltaX, boardRect.left - keyRect.left), boardRect.right - keyRect.right);
  const vertical = Math.min(Math.max(deltaY, boardRect.top - keyRect.top), boardRect.bottom - keyRect.bottom);
  return { x: horizontal, y: vertical };
}

function moveKeyBy(deltaX, deltaY) {
  const clamped = clampKeyMove(deltaX, deltaY);
  setKeyOffset(state.keyOffset.x + clamped.x, state.keyOffset.y + clamped.y);
}

function keyOverlapsLock() {
  const keyRect = elements.key.getBoundingClientRect();
  const lockRect = elements.lock.getBoundingClientRect();
  const padding = 10;
  return !(
    keyRect.right < lockRect.left - padding ||
    keyRect.left > lockRect.right + padding ||
    keyRect.bottom < lockRect.top - padding ||
    keyRect.top > lockRect.bottom + padding
  );
}

async function moveKeyToLock() {
  const keyRect = elements.key.getBoundingClientRect();
  const lockRect = elements.lock.getBoundingClientRect();
  const deltaX = lockRect.left + lockRect.width / 2 - (keyRect.left + keyRect.width / 2);
  const deltaY = lockRect.top + lockRect.height / 2 - (keyRect.top + keyRect.height / 2);
  moveKeyBy(deltaX, deltaY);
  await wait(430);
}

function setBusy(isBusy) {
  state.busy = isBusy;
  elements.board.classList.toggle("is-busy", isBusy);
  elements.key.setAttribute("aria-disabled", String(isBusy || state.complete));
}

async function playAnomaly(anomaly, currentRun) {
  if (currentRun !== runId) return false;
  const eventClass = `event-${anomaly.id}`;
  elements.eventMessage.textContent = anomaly.message;
  elements.board.classList.add("event-active", eventClass);
  elements.eventBanner.setAttribute("aria-hidden", "false");
  setStatus(anomaly.status, true);
  sound.play(anomaly.sound);
  addLedgerEntry(anomaly.message);

  await wait(anomaly.duration);
  if (currentRun !== runId) return false;

  elements.board.classList.remove("event-active", eventClass);
  elements.eventBanner.setAttribute("aria-hidden", "true");
  await wait(120);
  return currentRun === runId;
}

async function playTransition(message, status, className, currentRun) {
  if (currentRun !== runId) return false;
  elements.eventMessage.textContent = message;
  elements.board.classList.add("event-active", className);
  elements.eventBanner.setAttribute("aria-hidden", "false");
  setStatus(status, true);
  addLedgerEntry(message);
  sound.play("success");
  await wait(1450);
  if (currentRun !== runId) return false;
  elements.board.classList.remove("event-active");
  elements.eventBanner.setAttribute("aria-hidden", "true");
  return true;
}

async function finishStage(currentRun) {
  if (state.stage === 0) {
    const continued = await playTransition(
      "The key opens a drawer containing another key.",
      "Drawer open. Naturally, it contains the next key.",
      "drawer-open",
      currentRun,
    );
    if (!continued) return;
    state.stage = 1;
    state.attempts = 0;
    renderStage();
    return;
  }

  if (state.stage === 1) {
    const continued = await playTransition(
      "A smaller door appears beneath the original door.",
      "Smaller door registered. Its necessity is classified.",
      "small-door-appears",
      currentRun,
    );
    if (!continued) return;
    state.stage = 2;
    state.attempts = 0;
    renderStage();
    return;
  }

  completePuzzle();
}

function completePuzzle() {
  state.complete = true;
  setBusy(false);
  elements.board.classList.add("is-complete");
  elements.key.setAttribute("aria-disabled", "true");
  elements.finalReveal.setAttribute("aria-hidden", "false");
  elements.finalReveal.removeAttribute("inert");
  elements.stageKicker.textContent = "Case status · Recursively open";
  elements.stageTitle.textContent = "Access granted, unfortunately";
  elements.stageBrief.textContent = "The outer door is open. The inner door has filed an objection.";
  elements.attemptLabel.textContent = "All tests filed";
  elements.attemptPips.forEach((pip) => pip.classList.add("is-filled"));
  updateProgress();
  addLedgerEntry("Outer door opened. Inner problem discovered.");
  setStatus("You have unlocked another problem.", false);
  sound.play("final");
}

async function attemptUnlock({ keyboard = false } = {}) {
  if (state.busy || state.complete) return;
  const currentRun = runId;
  setBusy(true);

  if (keyboard) {
    setStatus("Routing key to the designated lock…", true);
    await moveKeyToLock();
    if (currentRun !== runId) return;
  }

  if (!keyOverlapsLock()) {
    setStatus("The key missed the lock. Reposition and try again.", false);
    sound.play("reject");
    setBusy(false);
    resetKeyPosition();
    return;
  }

  sound.play("drop");
  setStatus("Lock contact registered. Running unnecessary checks…", true);

  const eventCount = ANOMALIES_PER_DROP[state.dropIndex] ?? 1;
  state.dropIndex += 1;

  for (let index = 0; index < eventCount; index += 1) {
    const anomaly = state.anomalyQueue[state.anomalyIndex];
    state.anomalyIndex += 1;
    if (!anomaly) break;
    const continued = await playAnomaly(anomaly, currentRun);
    if (!continued) return;
  }

  state.attempts += 1;
  updateAttempts();

  if (state.attempts >= ATTEMPTS_PER_STAGE) {
    await finishStage(currentRun);
    return;
  }

  setBusy(false);
  resetKeyPosition();
  setStatus(`Test ${state.attempts} accepted. The lock requests one redundant confirmation.`, false);
}

function onPointerDown(event) {
  if (state.busy || state.complete || (event.pointerType === "mouse" && event.button !== 0)) return;
  event.preventDefault();
  sound.play("pickup");
  elements.key.setPointerCapture(event.pointerId);
  elements.key.classList.add("is-dragging");
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: state.keyOffset.x,
    offsetY: state.keyOffset.y,
    startRect: elements.key.getBoundingClientRect(),
    boardRect: elements.board.getBoundingClientRect(),
  };
  setStatus("Key in transit. Aim for the marked lock.", false);
}

function onPointerMove(event) {
  if (!drag || drag.pointerId !== event.pointerId) return;
  event.preventDefault();
  const rawX = event.clientX - drag.startX;
  const rawY = event.clientY - drag.startY;
  const deltaX = Math.min(Math.max(rawX, drag.boardRect.left - drag.startRect.left), drag.boardRect.right - drag.startRect.right);
  const deltaY = Math.min(Math.max(rawY, drag.boardRect.top - drag.startRect.top), drag.boardRect.bottom - drag.startRect.bottom);
  setKeyOffset(drag.offsetX + deltaX, drag.offsetY + deltaY);
}

function finishPointerDrag(event, cancelled = false) {
  if (!drag || drag.pointerId !== event.pointerId) return;
  const pointerId = drag.pointerId;
  drag = null;
  elements.key.classList.remove("is-dragging");
  if (elements.key.hasPointerCapture(pointerId)) elements.key.releasePointerCapture(pointerId);

  if (cancelled) {
    resetKeyPosition();
    setStatus("Key movement cancelled.", false);
    return;
  }

  if (keyOverlapsLock()) attemptUnlock();
  else {
    resetKeyPosition();
    setStatus("No lock contact. The key has returned to its tray.", false);
  }
}

function onKeyDown(event) {
  if (state.busy || state.complete) return;
  const distance = event.shiftKey ? 48 : 18;
  const moves = {
    ArrowLeft: [-distance, 0],
    ArrowRight: [distance, 0],
    ArrowUp: [0, -distance],
    ArrowDown: [0, distance],
  };

  if (moves[event.key]) {
    event.preventDefault();
    moveKeyBy(...moves[event.key]);
    setStatus("Key repositioned. Press Enter to test it, or keep moving.", false);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    attemptUnlock({ keyboard: true });
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    resetKeyPosition();
    setStatus("Key returned to its tray.", false);
  }
}

function updateSoundButton() {
  elements.soundToggle.setAttribute("aria-pressed", String(sound.enabled));
  elements.soundLabel.textContent = sound.enabled ? "Sound on" : "Sound off";
  elements.soundIcon.textContent = sound.enabled ? "◖))" : "◖×";
  elements.soundToggle.setAttribute("aria-label", sound.enabled ? "Turn sound off" : "Turn sound on");
}

function toggleSound() {
  sound.enabled = !sound.enabled;
  updateSoundButton();
  if (sound.enabled) sound.play("pickup");
  setStatus(`Sound ${sound.enabled ? "on" : "off"}.`, false);
}

function resetPuzzle({ focusKey = false } = {}) {
  runId += 1;
  drag = null;
  state = createState();
  elements.eventFeed.replaceChildren();
  addLedgerEntry("Key issued. Confidence unwarranted.");
  renderStage({ announce: false });
  sound.play("reset");
  setStatus("Puzzle reset. Drag the plausible key into door lock L–01.", false);
  if (focusKey) window.setTimeout(() => elements.key.focus(), 0);
}

elements.key.addEventListener("pointerdown", onPointerDown);
elements.key.addEventListener("pointermove", onPointerMove);
elements.key.addEventListener("pointerup", (event) => finishPointerDrag(event));
elements.key.addEventListener("pointercancel", (event) => finishPointerDrag(event, true));
elements.key.addEventListener("keydown", onKeyDown);
elements.soundToggle.addEventListener("click", toggleSound);
elements.resetButton.addEventListener("click", () => resetPuzzle());
elements.finalReset.addEventListener("click", () => resetPuzzle({ focusKey: true }));
window.addEventListener("resize", () => {
  if (!drag && !state.busy && !state.complete) resetKeyPosition();
});

updateSoundButton();
renderStage({ announce: false });

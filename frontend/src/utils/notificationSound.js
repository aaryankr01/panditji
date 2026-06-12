/**
 * notificationSound.js
 *
 * Generates notification tones via Web Audio API — zero external audio files,
 * works on desktop and iOS Safari (after user gesture unlock).
 *
 * iOS Safari silences audio until the user interacts with the page.
 * Call unlockAudio() on the first user click/touch to pre-warm the AudioContext.
 */

let audioCtx = null;
let bookingRingInterval = null;
let isBookingRinging = false;

const getAudioCtx = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return null;
    }
  }
  return audioCtx;
};

/** Call this on the first user tap/click to unlock iOS audio. */
export const unlockAudio = () => {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

/**
 * Play a short beep.
 * @param {number} frequency - Hz
 * @param {number} duration  - seconds
 * @param {string} type      - oscillator type ('sine'|'square'|'sawtooth'|'triangle')
 * @param {number} gain      - volume 0-1
 */
const playTone = (frequency, duration, type = 'sine', gain = 0.35) => {
  const ctx = getAudioCtx();
  if (!ctx) return;

  // Resume if suspended (iOS)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

/**
 * Booking ring — a three-tone ascending arpeggio that loops every 2.5 seconds.
 * Mirrors the urgency of a phone ring. Stops when stopBookingRing() is called.
 */
export const playBookingRing = () => {
  if (isBookingRinging) return; // Already ringing
  isBookingRinging = true;

  const ring = () => {
    playTone(523.25, 0.18, 'sine', 0.4);  // C5
    setTimeout(() => playTone(659.25, 0.18, 'sine', 0.4), 200); // E5
    setTimeout(() => playTone(783.99, 0.35, 'sine', 0.4), 400); // G5
  };

  ring(); // play immediately
  bookingRingInterval = setInterval(ring, 2500);
};

/**
 * Stop the booking ring (call when pandit accepts/rejects).
 */
export const stopBookingRing = () => {
  isBookingRinging = false;
  if (bookingRingInterval) {
    clearInterval(bookingRingInterval);
    bookingRingInterval = null;
  }
};

/**
 * Booking accepted — a warm, two-note "success" ding.
 */
export const playAcceptDing = () => {
  playTone(523.25, 0.25, 'sine', 0.35); // C5
  setTimeout(() => playTone(1046.5, 0.45, 'sine', 0.3), 180); // C6
};

/**
 * Chat message — a soft, subtle single ding.
 */
export const playChatDing = () => {
  playTone(880, 0.3, 'sine', 0.2); // A5 — gentle
};

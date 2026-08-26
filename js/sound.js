// Verse Wars: sound
//
// Small synthesized blips for card plays, draws, and win/lose, generated
// with oscillators (no audio files involved). AudioContext is only created
// lazily, on the first call after a user gesture, to respect browser
// autoplay rules.

window.VW = window.VW || {};

(function () {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, duration, opts) {
    opts = opts || {};
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = opts.type || 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(c.destination);
    const t0 = c.currentTime + (opts.delay || 0);
    const peak = opts.gain != null ? opts.gain : 0.12;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  }

  const sound = {
    setEnabled(v) {
      enabled = v;
    },
    isEnabled() {
      return enabled;
    },
    start() {
      tone(392, 0.1, { type: 'triangle', delay: 0, gain: 0.1 });
      tone(523, 0.14, { type: 'triangle', delay: 0.09, gain: 0.1 });
    },
    playCard() {
      tone(523, 0.1, { type: 'triangle', gain: 0.1 });
    },
    drawCard() {
      tone(340, 0.07, { type: 'sine', gain: 0.06 });
    },
    aiTurn() {
      tone(260, 0.09, { type: 'sine', gain: 0.05 });
    },
    win() {
      tone(523.25, 0.16, { delay: 0, gain: 0.11 });
      tone(659.25, 0.16, { delay: 0.13, gain: 0.11 });
      tone(783.99, 0.26, { delay: 0.26, gain: 0.12 });
    },
    lose() {
      tone(392, 0.22, { type: 'sine', delay: 0, gain: 0.09 });
      tone(311, 0.32, { type: 'sine', delay: 0.16, gain: 0.09 });
    },
    hpLost() {
      tone(220, 0.16, { type: 'sawtooth', delay: 0, gain: 0.07 });
    },
    runOver() {
      tone(311, 0.22, { type: 'sine', delay: 0, gain: 0.1 });
      tone(261.6, 0.22, { type: 'sine', delay: 0.16, gain: 0.1 });
      tone(196, 0.4, { type: 'sine', delay: 0.32, gain: 0.1 });
    },
    runComplete() {
      tone(523.25, 0.14, { delay: 0, gain: 0.12 });
      tone(659.25, 0.14, { delay: 0.12, gain: 0.12 });
      tone(783.99, 0.14, { delay: 0.24, gain: 0.12 });
      tone(1046.5, 0.4, { delay: 0.36, gain: 0.13 });
    },
    unlock() {
      tone(660, 0.09, { type: 'square', delay: 0, gain: 0.07 });
      tone(880, 0.14, { type: 'square', delay: 0.07, gain: 0.07 });
    },
    achievement() {
      tone(587.33, 0.1, { type: 'triangle', delay: 0, gain: 0.1 });
      tone(739.99, 0.1, { type: 'triangle', delay: 0.08, gain: 0.1 });
      tone(880, 0.1, { type: 'triangle', delay: 0.16, gain: 0.1 });
      tone(1174.66, 0.3, { type: 'triangle', delay: 0.24, gain: 0.12 });
    },
  };

  window.VW.sound = sound;
})();

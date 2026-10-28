export function initBackgroundMusic() {
  if (
    !['/', '/index.html', '/recruitment/', '/recruitment'].includes(
      location.pathname,
    )
  )
    return;
  var AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  var musicButton = document.createElement('button');
  musicButton.type = 'button';
  musicButton.className = 'music-toggle';
  musicButton.setAttribute('role', 'switch');
  musicButton.setAttribute('aria-label', 'Background music');
  musicButton.setAttribute('aria-checked', 'false');
  musicButton.title =
    'Optional soft piano, gentle shore waves and distant birds';
  musicButton.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg><span class="music-switch-track" aria-hidden="true"><span class="music-switch-thumb"></span></span><span class="music-state" aria-hidden="true">Off</span>';
  document.body.appendChild(musicButton);
  var engine = null,
    master = null,
    timer = null,
    enabled = false,
    step = 0,
    nextTime = 0,
    nextNatureTime = 0;
  var eighth = 60 / 84 / 2;
  // Light syncopated notes over warm harmony, without percussion or a driving bass.
  var harmony = [
    [50, 54, 57, 61, 64],
    [50, 54, 57, 61, 64],
    [47, 50, 54, 57, 61],
    [47, 50, 54, 57, 61],
    [52, 55, 59, 62, 66],
    [57, 61, 64, 67, 71],
    [50, 54, 57, 61, 64],
    [50, 54, 57, 61, 64],
  ];
  var melody = [
    73,
    null,
    76,
    78,
    null,
    76,
    73,
    null,
    69,
    null,
    73,
    76,
    null,
    74,
    73,
    null,
    71,
    null,
    73,
    74,
    null,
    73,
    69,
    null,
    66,
    null,
    69,
    73,
    null,
    71,
    69,
    null,
    71,
    null,
    74,
    78,
    null,
    76,
    74,
    null,
    73,
    null,
    76,
    79,
    null,
    76,
    73,
    null,
    74,
    null,
    78,
    81,
    null,
    78,
    76,
    null,
    73,
    null,
    69,
    71,
    null,
    73,
    74,
    null,
  ];
  function tone(note, time, duration, level, bass) {
    var voice = engine.createGain();
    var frequency = 440 * Math.pow(2, (note - 69) / 12);
    voice.gain.setValueAtTime(0, time);
    voice.gain.linearRampToValueAtTime(level, time + 0.009);
    voice.gain.exponentialRampToValueAtTime(level * 0.7, time + 0.11);
    voice.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    voice.connect(master);
    var sources = [];
    [1, 2, 3, 4, 5, 6].forEach(function (partial) {
      var oscillator = engine.createOscillator(),
        weight = engine.createGain();
      oscillator.type = 'sine';
      // Slight string inharmonicity and faster upper-partial decay soften the piano tone.
      oscillator.frequency.value =
        frequency * partial * Math.sqrt(1 + 0.00008 * partial * partial);
      var strength = [0, 1, 0.28, 0.12, 0.05, 0.018, 0.008][partial];
      weight.gain.setValueAtTime(strength, time);
      weight.gain.exponentialRampToValueAtTime(
        0.0001,
        time + duration / (1 + (partial - 1) * 0.3),
      );
      oscillator.connect(weight);
      weight.connect(voice);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.04);
      oscillator.onended = function () {
        oscillator.disconnect();
        weight.disconnect();
      };
      sources.push(oscillator);
    });
    sources[0].addEventListener('ended', function () {
      voice.disconnect();
    });
  }
  var waterBuffer = null,
    nextBirdTime = 0;
  function natureSwell(time) {
    // One quiet incoming wave and a longer retreat, followed by genuine silence.
    if (!waterBuffer) {
      waterBuffer = engine.createBuffer(
        1,
        Math.ceil(engine.sampleRate * 8),
        engine.sampleRate,
      );
      var samples = waterBuffer.getChannelData(0),
        deep = 0;
      for (var i = 0; i < samples.length; i++) {
        var white = Math.random() * 2 - 1;
        deep = 0.98 * deep + 0.02 * white;
        samples[i] = deep * 4 + white * 0.18;
      }
    }
    var shore = engine.createBufferSource(),
      low = engine.createBiquadFilter(),
      high = engine.createBiquadFilter(),
      envelope = engine.createGain();
    shore.buffer = waterBuffer;
    high.type = 'highpass';
    high.frequency.value = 65;
    high.Q.value = 0.45;
    low.type = 'lowpass';
    low.Q.value = 0.35;
    low.frequency.setValueAtTime(650, time);
    low.frequency.linearRampToValueAtTime(1500, time + 2.4);
    low.frequency.linearRampToValueAtTime(500, time + 7.5);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(0.025, time + 0.35);
    envelope.gain.linearRampToValueAtTime(0.14, time + 2.4);
    envelope.gain.linearRampToValueAtTime(0.07, time + 4.2);
    envelope.gain.linearRampToValueAtTime(0.018, time + 6);
    envelope.gain.linearRampToValueAtTime(0, time + 7.5);
    shore.connect(high);
    high.connect(low);
    low.connect(envelope);
    envelope.connect(master);
    shore.start(time);
    shore.stop(time + 7.7);
    shore.onended = function () {
      shore.disconnect();
      high.disconnect();
      low.disconnect();
      envelope.disconnect();
    };
  }
  function distantBird(time) {
    // Brief, irregular warbles: no sustained pure-tone whistle or repeating alarm.
    var base = 1750 + Math.random() * 350;
    [0, 0.19, 0.43].forEach(function (offset, index) {
      var start = time + offset,
        duration = 0.09 + Math.random() * 0.05;
      var bird = engine.createOscillator(),
        flutter = engine.createOscillator(),
        depth = engine.createGain(),
        gain = engine.createGain();
      bird.type = 'triangle';
      flutter.frequency.value = 27 + Math.random() * 12;
      depth.gain.value = 35;
      flutter.connect(depth);
      depth.connect(bird.frequency);
      bird.frequency.setValueAtTime(base * (index === 1 ? 1.18 : 1), start);
      bird.frequency.exponentialRampToValueAtTime(
        base * (index === 2 ? 0.92 : 1.35),
        start + duration * 0.45,
      );
      bird.frequency.exponentialRampToValueAtTime(
        base * 0.98,
        start + duration,
      );
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.022, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      bird.connect(gain);
      gain.connect(master);
      bird.start(start);
      flutter.start(start);
      bird.stop(start + duration + 0.02);
      flutter.stop(start + duration + 0.02);
      bird.onended = function () {
        bird.disconnect();
        flutter.disconnect();
        depth.disconnect();
        gain.disconnect();
      };
    });
  }
  function schedule() {
    if (!enabled || !engine || engine.state !== 'running' || document.hidden)
      return;
    // A delayed background timer must never queue a burst of missed notes.
    if (nextTime < engine.currentTime) nextTime = engine.currentTime + 0.05;
    if (engine.currentTime + 0.18 >= nextNatureTime) {
      natureSwell(engine.currentTime + 0.08);
      nextNatureTime = engine.currentTime + 13 + Math.random() * 6;
    }
    if (engine.currentTime + 0.18 >= nextBirdTime) {
      distantBird(engine.currentTime + 0.08);
      nextBirdTime = engine.currentTime + 16 + Math.random() * 12;
    }
    while (nextTime < engine.currentTime + 0.18) {
      var bar = Math.floor(step / 8) % 8,
        position = step % 8,
        chord = harmony[bar];
      if (position === 0)
        chord.forEach(function (note, i) {
          tone(note, nextTime + i * 0.018, 4.5, 0.022, false);
        });
      var note = melody[step % melody.length];
      if (note !== null) tone(note - 12, nextTime, 3.2, 0.038, false);
      nextTime += eighth;
      step = (step + 1) % 64;
    }
  }
  var wanted = false,
    startedAt = 0;
  function updateMusicButton() {
    musicButton.setAttribute('aria-checked', String(enabled));
    musicButton.querySelector('.music-state').textContent = enabled
      ? 'On'
      : wanted
        ? 'Resume'
        : 'Off';
    musicButton.title =
      wanted && !enabled
        ? 'Tap to resume music if your browser blocks playback.'
        : 'Optional soft piano, gentle shore waves and distant birds';
  }
  function releaseAudio() {
    enabled = false;
    clearInterval(timer);
    timer = null;
    var previous = engine,
      previousMaster = master;
    engine = null;
    master = null;
    if (previous) {
      previousMaster.gain.cancelScheduledValues(previous.currentTime);
      previousMaster.gain.setTargetAtTime(0, previous.currentTime, 0.025);
      setTimeout(function () {
        previous.close().catch(function () {});
      }, 120);
    }
    updateMusicButton();
  }
  function stopMusic() {
    wanted = false;
    startedAt = 0;
    releaseAudio();
  }
  function startMusic() {
    wanted = true;
    if (!startedAt) startedAt = Date.now();
    try {
      if (!engine) {
        engine = new AudioEngine();
        waterBuffer = null;
        master = engine.createGain();
        master.gain.value = 0.55;
        var limiter = engine.createDynamicsCompressor();
        limiter.threshold.value = -18;
        limiter.knee.value = 18;
        limiter.ratio.value = 3;
        var warmth = engine.createBiquadFilter();
        warmth.type = 'lowpass';
        warmth.frequency.value = 2400;
        warmth.Q.value = 0.5;
        master.connect(warmth);
        warmth.connect(limiter);
        limiter.connect(engine.destination);
        var current = engine;
        function activate() {
          if (
            engine !== current ||
            !wanted ||
            current.state !== 'running' ||
            document.hidden
          )
            return;
          if (!enabled) {
            enabled = true;
            step =
              Math.floor(Math.max(0, Date.now() - startedAt) / 1000 / eighth) %
              64;
            nextTime = current.currentTime + 0.06;
            nextNatureTime = current.currentTime + 0.1;
            nextBirdTime = current.currentTime + 5;
            clearInterval(timer);
            timer = setInterval(schedule, 80);
            schedule();
          }
          updateMusicButton();
        }
        current.addEventListener('statechange', activate);
        current
          .resume()
          .then(activate)
          .catch(function () {
            if (engine === current) updateMusicButton();
          });
      } else {
        engine.resume().catch(function () {
          updateMusicButton();
        });
      }
    } catch (error) {
      releaseAudio();
    }
    updateMusicButton();
  }
  musicButton.addEventListener('click', function () {
    if (enabled) stopMusic();
    else startMusic();
  });
  // Homepage-only audio; gesture fallback handles stricter browser playback policies.
  function resumeAfterGesture(event) {
    if (wanted && !enabled && !musicButton.contains(event.target)) startMusic();
  }
  document.addEventListener('pointerdown', resumeAfterGesture, {
    passive: true,
  });
  document.addEventListener('keydown', resumeAfterGesture);
  document.addEventListener('visibilitychange', function () {
    if (!wanted || !engine) return;
    if (document.hidden) engine.suspend().catch(function () {});
    else
      engine
        .resume()
        .then(function () {
          if (engine) {
            nextTime = engine.currentTime + 0.06;
            schedule();
          }
        })
        .catch(function () {
          enabled = false;
          updateMusicButton();
        });
  });
  window.addEventListener('pagehide', releaseAudio);
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    if (wanted) startMusic();
    else releaseAudio();
  });
  if (wanted) startMusic();
}

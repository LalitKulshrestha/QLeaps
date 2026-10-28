const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
export let reducedMotion = preference.matches;
export let motionPaused = reducedMotion;

export function initMotion() {
  const button = document.querySelector('#motionToggle');
  function update() {
    document.documentElement.classList.toggle('motion-paused', motionPaused);
    if (button) {
      button.textContent = motionPaused
        ? 'Play ambient motion'
        : 'Pause ambient motion';
      button.setAttribute('aria-pressed', String(!motionPaused));
    }
    document.dispatchEvent(new Event('ql-motion-change'));
  }
  button?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    update();
  });
  preference.addEventListener('change', (event) => {
    reducedMotion = event.matches;
    motionPaused = reducedMotion;
    update();
  });
  update();
  document
    .querySelectorAll('video[data-background-video],.hero-video-player')
    .forEach((video) => {
      let visible = false;
      function sync() {
        if (
          video.closest('[hidden]') ||
          motionPaused ||
          document.hidden ||
          !visible ||
          navigator.connection?.saveData
        ) {
          video.pause();
          return;
        }
        video.play().catch(() => {
          video.controls = true;
        });
      }
      if ('IntersectionObserver' in window)
        new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          sync();
        }).observe(video);
      else {
        visible = true;
        sync();
      }
      document.addEventListener('ql-motion-change', sync);
      document.addEventListener('visibilitychange', sync);
    });
}

export function initReveals() {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add('will-reveal');
    observer.observe(element);
  });
  const closing = document.querySelector('.closing-conversation');
  if (closing)
    new IntersectionObserver((entries) =>
      closing.classList.toggle('flow-visible', entries[0].isIntersecting),
    ).observe(closing);
}

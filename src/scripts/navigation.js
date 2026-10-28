import { reducedMotion } from './motion.js';
export function scrollToId(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.style.opacity = '1';
  element.style.transform = 'none';
  const header =
    document.querySelector('.site-header')?.getBoundingClientRect().height ||
    80;
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - header - 12,
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
}
export function initNavigation() {
  const header = document.querySelector('.site-header'),
    toggle = header?.querySelector('.nav-toggle');
  if (!header || !toggle) return;
  const close = (focus = false) => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (focus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('nav-open');
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close(true);
  });
  header.addEventListener('click', (event) => {
    if (event.target.closest('nav a')) close();
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) close();
  });
  header.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) close();
  });
  function measure() {
    document.documentElement.style.setProperty(
      '--header-height',
      `${Math.ceil(header.getBoundingClientRect().height)}px`,
    );
  }
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
  document.querySelectorAll('a[href^="#"],[data-target]').forEach((link) =>
    link.addEventListener('click', (event) => {
      const target = link.dataset.target || link.getAttribute('href').slice(1);
      if (target && document.getElementById(target)) {
        event.preventDefault();
        history.replaceState(null, '', `#${target}`);
        scrollToId(target);
      }
    }),
  );
}

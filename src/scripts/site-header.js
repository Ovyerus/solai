const header = document.querySelector('.site-header');
const root = document.documentElement;

function measureHeader() {
  root.style.setProperty('--site-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
}

measureHeader();
new ResizeObserver(measureHeader).observe(header);

const top = document.querySelector('[data-header-top]');
if (top) {
  header.dataset.atTop = String(window.scrollY === 0);
  new IntersectionObserver(([entry]) => {
    header.dataset.atTop = String(entry.isIntersecting && entry.intersectionRatio === 1);
  }, { threshold: 1 }).observe(top);
}

// Mobile nav toggle
const sidebar = document.querySelector('.sidebar');
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Lightbox for project images
const box = document.querySelector('.lightbox');
const boxImg = box.querySelector('img');
document.querySelectorAll('a.zoom').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    boxImg.src = a.href;
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  });
});
const close = () => {
  if (box.hidden) return;
  box.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => { box.hidden = true; boxImg.removeAttribute('src'); }, 200);
};
box.addEventListener('click', close);
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

// "Back to Top" links
document.querySelectorAll('a[href="#top"]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0 }); });
});

// Fade content in as it scrolls into view
const revealables = document.querySelectorAll('.cover, .project + .project');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealables.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

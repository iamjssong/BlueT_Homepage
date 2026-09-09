const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '메뉴 열기');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

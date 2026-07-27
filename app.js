const currentPage = document.body.dataset.page || 'home';
const sidebar = document.querySelector('.sidebar');
const menuButton = document.querySelector('.menu-toggle');
const sidebarContent = document.querySelector('.sidebar-content');

sidebarContent.innerHTML = `
  <a class="sidebar-brand" href="index.html" data-menu-link>
    <span class="brand-mark">EW</span>
    <span><strong>Eungyu Woo</strong><small>Computer Science</small></span>
  </a>
  <nav class="nav-scroll">
    <div class="nav-group">
      <a class="nav-primary" href="index.html" data-page="home" data-menu-link>Home</a>
      <div class="nav-secondary"><a href="index.html#contact" data-page="home" data-section="contact" data-menu-link>Contact info</a></div>
    </div>
    <div class="nav-group">
      <a class="nav-primary" href="about.html" data-page="about" data-menu-link>About me</a>
      <div class="nav-secondary">
        <a href="about.html#education" data-page="about" data-section="education" data-menu-link>Education</a>
        <a href="about.html#work" data-page="about" data-section="work" data-menu-link>Work experience</a>
        <a href="about.html#teaching" data-page="about" data-section="teaching" data-menu-link>Teaching experience</a>
      </div>
    </div>
    <div class="nav-group">
      <a class="nav-primary" href="papers.html" data-page="papers" data-menu-link>Papers</a>
      <div class="nav-secondary">
        <a href="papers.html#international-journals" data-page="papers" data-section="international-journals" data-menu-link>International journals</a>
        <a href="papers.html#international-conferences" data-page="papers" data-section="international-conferences" data-menu-link>International conferences</a>
        <a href="papers.html#domestic-journals" data-page="papers" data-section="domestic-journals" data-menu-link>Domestic journals</a>
        <a href="papers.html#domestic-conferences" data-page="papers" data-section="domestic-conferences" data-menu-link>Domestic conferences</a>
        <a href="papers.html#preprints" data-page="papers" data-section="preprints" data-menu-link>Preprints</a>
      </div>
    </div>
    <div class="nav-group">
      <a class="nav-primary" href="etc.html" data-page="etc" data-menu-link>Others</a>
      <div class="nav-secondary">
        <a href="etc.html#seminar" data-page="etc" data-section="seminar" data-menu-link>Seminar</a>
        <a href="etc.html#talks" data-page="etc" data-section="talks" data-menu-link>Talks</a>
        <a href="etc.html#awards" data-page="etc" data-section="awards" data-menu-link>Awards</a>
      </div>
    </div>
  </nav>`;

const desktopMenu = window.matchMedia('(min-width: 721px)');
const sidebarPositionKey = 'eungyu-woo-sidebar-position-v4';
const sidebarMargin = 8;
let dragState = null;
let suppressMenuToggle = false;
let savedSidebarPosition = null;
let forcedInsideProfile = false;

function clampSidebarPosition(left, top) {
  const expandedWidth = Math.min(254, window.innerWidth - sidebarMargin * 2);
  return {
    left: Math.min(Math.max(sidebarMargin, left), Math.max(sidebarMargin, window.innerWidth - expandedWidth - sidebarMargin)),
    top: Math.min(Math.max(sidebarMargin, top), Math.max(sidebarMargin, window.innerHeight - 54 - sidebarMargin)),
  };
}

function getAdaptiveSidebarPosition() {
  const profile = document.querySelector('.hero-card') || document.querySelector('main');
  const profileBounds = profile.getBoundingClientRect();
  const outsideLeft = profileBounds.right + 14;
  return {
    hasExternalSpace: window.innerWidth - outsideLeft >= 254 + sidebarMargin,
    inside: { left: profileBounds.left, top: 54 },
  };
}

function applySidebarPosition(position, save = false) {
  if (!desktopMenu.matches) return;
  const next = clampSidebarPosition(position.left, position.top);
  sidebar.classList.add('has-custom-position');
  sidebar.style.setProperty('--sidebar-left', `${next.left}px`);
  sidebar.style.setProperty('--sidebar-top', `${next.top}px`);
  if (save) {
    savedSidebarPosition = next;
    try { localStorage.setItem(sidebarPositionKey, JSON.stringify(next)); } catch (_) { /* Position persistence is optional. */ }
  }
}

function clearSidebarPosition() {
  sidebar.classList.remove('has-custom-position');
  sidebar.style.removeProperty('--sidebar-left');
  sidebar.style.removeProperty('--sidebar-top');
}

function restoreSidebarPosition() {
  if (!desktopMenu.matches) return;
  try {
    const savedPosition = JSON.parse(localStorage.getItem(sidebarPositionKey));
    if (Number.isFinite(savedPosition?.left) && Number.isFinite(savedPosition?.top)) savedSidebarPosition = savedPosition;
  } catch (_) { /* Keep the CSS default when stored data is unavailable. */ }
  const adaptivePosition = getAdaptiveSidebarPosition();
  if (!adaptivePosition.hasExternalSpace) {
    forcedInsideProfile = true;
    applySidebarPosition(adaptivePosition.inside);
  } else if (savedSidebarPosition) {
    applySidebarPosition(savedSidebarPosition);
  }
}

function updateSidebarForViewport() {
  if (!desktopMenu.matches) return;
  const adaptivePosition = getAdaptiveSidebarPosition();
  if (!adaptivePosition.hasExternalSpace) {
    forcedInsideProfile = true;
    applySidebarPosition(adaptivePosition.inside);
    return;
  }
  if (forcedInsideProfile) {
    forcedInsideProfile = false;
    if (savedSidebarPosition) applySidebarPosition(savedSidebarPosition);
    else clearSidebarPosition();
    return;
  }
  if (sidebar.classList.contains('has-custom-position')) {
    const rect = sidebar.getBoundingClientRect();
    applySidebarPosition({ left: rect.left, top: rect.top });
  }
}

function finishSidebarDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const wasMoved = dragState.moved;
  const elementAtDrop = document.elementFromPoint(event.clientX, event.clientY);
  const droppedOutsideSidebar = !elementAtDrop || !sidebar.contains(elementAtDrop);
  if (wasMoved) {
    const rect = sidebar.getBoundingClientRect();
    applySidebarPosition({ left: rect.left, top: rect.top }, true);
    suppressMenuToggle = true;
    window.setTimeout(() => { suppressMenuToggle = false; }, 0);
  }
  menuButton.releasePointerCapture?.(event.pointerId);
  sidebar.classList.remove('is-dragging');
  dragState = null;
  if (wasMoved) menuButton.blur();
  if (wasMoved && droppedOutsideSidebar) setMenu(false);
}

menuButton.addEventListener('pointerdown', (event) => {
  if (!desktopMenu.matches || event.button !== 0) return;
  const rect = sidebar.getBoundingClientRect();
  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    moved: false,
  };
  menuButton.setPointerCapture(event.pointerId);
  sidebar.classList.add('is-dragging');
});

menuButton.addEventListener('pointermove', (event) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;
  if (!dragState.moved && Math.hypot(deltaX, deltaY) < 3) return;
  dragState.moved = true;
  applySidebarPosition({ left: dragState.startLeft + deltaX, top: dragState.startTop + deltaY });
  event.preventDefault();
});

menuButton.addEventListener('pointerup', finishSidebarDrag);
menuButton.addEventListener('pointercancel', finishSidebarDrag);

restoreSidebarPosition();
menuButton.title = 'Click to open or close. Drag to move.';

function setMenu(open) {
  sidebar.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open && window.matchMedia('(max-width: 720px)').matches);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation; drag to move' : 'Open navigation; drag to move');
}

menuButton.addEventListener('click', (event) => {
  if (suppressMenuToggle) {
    event.preventDefault();
    return;
  }
  const nextOpen = !sidebar.classList.contains('is-open');
  setMenu(nextOpen);
  if (!nextOpen && !desktopMenu.matches) menuButton.blur();
});
sidebar.addEventListener('pointerleave', () => {
  if (!desktopMenu.matches || dragState) return;
  setMenu(false);
  if (document.activeElement === menuButton) menuButton.blur();
});
document.querySelectorAll('[data-menu-close], [data-menu-link]').forEach((target) => target.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => {
  if (window.innerWidth > 720) document.body.classList.remove('menu-open');
  updateSidebarForViewport();
});

document.querySelector(`.nav-primary[data-page="${currentPage}"]`)?.classList.add('active');

const currentSections = [...document.querySelectorAll('[data-observe]')];
const currentSecondaryLinks = [...document.querySelectorAll(`.nav-secondary a[data-page="${currentPage}"]`)];
if (currentSections.length && currentSecondaryLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
    if (!visible.length) return;
    currentSecondaryLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === visible[0].target.id));
  }, { rootMargin: '-14% 0px -68% 0px', threshold: 0 });
  currentSections.forEach((section) => observer.observe(section));
}

document.querySelectorAll('[data-current-year]').forEach((year) => { year.textContent = new Date().getFullYear(); });

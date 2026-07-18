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
      <a class="nav-primary" href="etc.html" data-page="etc" data-menu-link>Talks &amp; Awards</a>
      <div class="nav-secondary">
        <a href="etc.html#talks" data-page="etc" data-section="talks" data-menu-link>Talks</a>
        <a href="etc.html#awards" data-page="etc" data-section="awards" data-menu-link>Awards</a>
      </div>
    </div>
  </nav>`;

function setMenu(open) {
  sidebar.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open && window.matchMedia('(max-width: 720px)').matches);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuButton.addEventListener('click', () => setMenu(!sidebar.classList.contains('is-open')));
document.querySelectorAll('[data-menu-close], [data-menu-link]').forEach((target) => target.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 720) document.body.classList.remove('menu-open'); });

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

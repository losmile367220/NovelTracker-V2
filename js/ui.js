(() => {
  const pageButtons = document.querySelectorAll('[data-page]');
  const pages = document.querySelectorAll('.nt-page');
  const title = document.getElementById('page-title');
  const breadcrumb = document.querySelector('.nt-breadcrumb');

  function showPage(pageName) {
    pages.forEach(page => page.classList.toggle('active', page.id === `page-${pageName}`));
    pageButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageName));

    const current = document.getElementById(`page-${pageName}`);
    const currentTitle = current?.dataset.title || 'NovelTracker';
    title.textContent = currentTitle;
    breadcrumb.textContent = pageName === 'home' ? '首頁' : `首頁 / ${currentTitle}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pageButtons.forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));

  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      showPage(btn.dataset.go);
      const target = btn.dataset.openMore;
      if (target) {
        setTimeout(() => document.getElementById(`more-${target}`)?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    });
  });

  window.NT_UI = { showPage };
})();

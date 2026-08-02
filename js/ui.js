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

    if (window.NT_SEARCH?.onPageChanged) {
      window.NT_SEARCH.onPageChanged(pageName);
    }
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


  let confirmResolver = null;

  function toast(message, type = "success", duration = 3000) {
    const region = document.getElementById("nt-toast-region");
    if (!region) return;

    const item = document.createElement("div");
    item.className = `nt-toast ${type}`;
    item.setAttribute("role", "status");

    const icon = document.createElement("span");
    icon.textContent = type === "error" ? "⚠️" : type === "info" ? "ℹ️" : "✅";

    const text = document.createElement("span");
    text.textContent = message;

    item.append(icon, text);
    region.appendChild(item);

    requestAnimationFrame(() => item.classList.add("show"));

    window.setTimeout(() => {
      item.classList.remove("show");
      window.setTimeout(() => item.remove(), 220);
    }, duration);
  }

  function confirmDialog(message, options = {}) {
    const backdrop = document.getElementById("nt-confirm-backdrop");
    const messageElement = document.getElementById("nt-confirm-message");
    const okButton = document.getElementById("nt-confirm-ok");
    const cancelButton = document.getElementById("nt-confirm-cancel");

    if (!backdrop || !messageElement || !okButton || !cancelButton) {
      return Promise.resolve(window.confirm(message));
    }

    messageElement.textContent = message;
    okButton.textContent = options.confirmText || "確認刪除";
    backdrop.hidden = false;

    requestAnimationFrame(() => backdrop.classList.add("open"));

    return new Promise(resolve => {
      confirmResolver = resolve;
      okButton.focus();
    });
  }

  function closeConfirm(result) {
    const backdrop = document.getElementById("nt-confirm-backdrop");
    if (!backdrop) return;

    backdrop.classList.remove("open");
    window.setTimeout(() => {
      backdrop.hidden = true;
    }, 170);

    if (confirmResolver) {
      confirmResolver(result);
      confirmResolver = null;
    }
  }

  document.getElementById("nt-confirm-ok")?.addEventListener("click", () => closeConfirm(true));
  document.getElementById("nt-confirm-cancel")?.addEventListener("click", () => closeConfirm(false));
  document.getElementById("nt-confirm-backdrop")?.addEventListener("click", event => {
    if (event.target.id === "nt-confirm-backdrop") closeConfirm(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !document.getElementById("nt-confirm-backdrop")?.hidden) {
      closeConfirm(false);
    }
  });

  window.NT_UI = {
    showPage,
    toast,
    confirmDialog
  };
})();

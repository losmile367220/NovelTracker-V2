(() => {
  "use strict";

  let matches = [];
  let currentIndex = -1;
  let activePageName = "home";

  const get = id => document.getElementById(id);

  function getActivePage() {
    return document.querySelector(".nt-page.active");
  }

  function getActivePageName() {
    const page = getActivePage();
    return page?.id?.replace("page-", "") || "home";
  }

  function searchableElementsForPage(pageName) {
    const selectors = {
      overview: "#overview-list .nt-content-card",
      novels: "#novel-list .nt-content-card",
      dramas: "#drama-list .nt-content-card"
    };

    const selector = selectors[pageName];
    return selector ? Array.from(document.querySelectorAll(selector)) : [];
  }

  function clearHighlights() {
    document.querySelectorAll(".nt-search-match, .nt-search-current").forEach(element => {
      element.classList.remove("nt-search-match", "nt-search-current");
    });
  }

  function updateStatus(message) {
    const status = get("nt-search-status");
    if (status) status.textContent = message;
  }

  function resetSearchState(clearInput = false) {
    clearHighlights();
    matches = [];
    currentIndex = -1;

    if (clearInput) {
      const input = get("nt-floating-search-input");
      if (input) input.value = "";
    }

    updateStatus("輸入關鍵字開始搜尋");
  }

  function openSearch() {
    const panel = get("nt-floating-search");
    const toggle = get("nt-floating-search-toggle");
    if (!panel || !toggle) return;

    panel.classList.add("open");
    toggle.hidden = true;
    activePageName = getActivePageName();

    setTimeout(() => get("nt-floating-search-input")?.focus(), 30);
  }

  function closeSearch() {
    const panel = get("nt-floating-search");
    const toggle = get("nt-floating-search-toggle");
    if (!panel || !toggle) return;

    panel.classList.remove("open");
    toggle.hidden = false;
    clearHighlights();
  }

  function performSearch() {
    const input = get("nt-floating-search-input");
    const keyword = input?.value.trim().toLocaleLowerCase("zh-TW") || "";
    activePageName = getActivePageName();

    clearHighlights();
    matches = [];
    currentIndex = -1;

    if (!["overview", "novels", "dramas"].includes(activePageName)) {
      updateStatus("請先切換到總覽、小說或短劇頁面");
      return;
    }

    if (!keyword) {
      updateStatus("輸入關鍵字開始搜尋");
      return;
    }

    searchableElementsForPage(activePageName).forEach(card => {
      const content = card.textContent.trim().toLocaleLowerCase("zh-TW");
      if (content.includes(keyword)) {
        card.classList.add("nt-search-match");
        matches.push(card);
      }
    });

    if (!matches.length) {
      updateStatus("找不到符合的資料");
      return;
    }

    currentIndex = 0;
    focusCurrentMatch();
  }

  function focusCurrentMatch() {
    if (!matches.length || currentIndex < 0) return;

    matches.forEach(card => card.classList.remove("nt-search-current"));

    const current = matches[currentIndex];
    current.classList.add("nt-search-current");
    current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });

    updateStatus(`${currentIndex + 1} / ${matches.length}`);
  }

  function nextMatch() {
    if (!matches.length) {
      performSearch();
      return;
    }

    currentIndex = (currentIndex + 1) % matches.length;
    focusCurrentMatch();
  }

  function previousMatch() {
    if (!matches.length) {
      performSearch();
      return;
    }

    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    focusCurrentMatch();
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.shiftKey ? previousMatch() : nextMatch();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    }
  }

  function handlePageChanged(pageName) {
    activePageName = pageName;
    resetSearchState(true);

    const toggle = get("nt-floating-search-toggle");
    if (toggle) {
      toggle.classList.toggle(
        "nt-search-disabled",
        !["overview", "novels", "dramas"].includes(pageName)
      );
      toggle.title = ["overview", "novels", "dramas"].includes(pageName)
        ? "搜尋目前頁面"
        : "請先切換到總覽、小說或短劇";
    }
  }

  function refreshAfterRender() {
    const panel = get("nt-floating-search");
    const input = get("nt-floating-search-input");

    if (panel?.classList.contains("open") && input?.value.trim()) {
      performSearch();
    }
  }

  function initialize() {
    get("nt-floating-search-toggle")?.addEventListener("click", openSearch);
    get("nt-search-close")?.addEventListener("click", closeSearch);
    get("nt-search-next")?.addEventListener("click", nextMatch);
    get("nt-search-prev")?.addEventListener("click", previousMatch);
    get("nt-floating-search-input")?.addEventListener("input", performSearch);
    get("nt-floating-search-input")?.addEventListener("keydown", handleKeydown);

    handlePageChanged(getActivePageName());
  }

  window.NT_SEARCH = {
    open: openSearch,
    close: closeSearch,
    perform: performSearch,
    next: nextMatch,
    previous: previousMatch,
    onPageChanged: handlePageChanged,
    refreshAfterRender
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

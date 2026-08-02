(() => {
  "use strict";

  const PAGE_CONFIG = {
    overview: [
      { index: 0, label: "分類", type: "category" },
      { index: 1, label: "小說名稱" },
      { index: 2, label: "作者" },
      { index: 3, label: "小說男主角" },
      { index: 4, label: "小說女主角" },
      { index: 5, label: "章節" },
      { index: 6, label: "小說完結狀態" },
      { index: 7, label: "TXT／備註" },
      { index: 8, label: "短劇名稱" },
      { index: 9, label: "短劇男主角" },
      { index: 10, label: "短劇女主角" },
      { index: 11, label: "進度" },
      { index: 12, label: "短劇完結狀態" }
    ],
    novels: [
      { index: 0, label: "分類", type: "category" },
      { index: 1, label: "小說名稱" },
      { index: 2, label: "作者" },
      { index: 3, label: "男主角" },
      { index: 4, label: "女主角" },
      { index: 5, label: "章節" },
      { index: 6, label: "完結狀態" },
      { index: 7, label: "TXT／備註" }
    ],
    dramas: [
      { index: 0, label: "分類", type: "category" },
      { index: 8, label: "短劇名稱" },
      { index: 9, label: "男主角" },
      { index: 10, label: "女主角" },
      { index: 11, label: "進度" },
      { index: 12, label: "完結狀態" }
    ]
  };

  const state = {
    overview: {},
    novels: {},
    dramas: {}
  };

  const text = value => value == null ? "" : String(value).trim();

  function getRows() {
    return NT_STORE.getRows();
  }

  function valuesForColumn(index, type) {
    const set = new Set();

    getRows().forEach(row => {
      const value = text(row[index]);
      if (!value || value === "-") return;

      if (type === "category") {
        value.split(",").map(item => item.trim()).filter(Boolean).forEach(item => set.add(item));
      } else {
        set.add(value);
      }
    });

    return [...set].sort((a, b) => a.localeCompare(b, "zh-Hant", { numeric: true }));
  }

  function buildControls(pageName) {
    const container = document.getElementById(`filter-controls-${pageName}`);
    if (!container) return;

    container.innerHTML = "";

    PAGE_CONFIG[pageName].forEach(config => {
      const field = document.createElement("label");
      field.className = "nt-filter-field";

      const title = document.createElement("span");
      title.textContent = config.label;

      const select = document.createElement("select");
      select.dataset.filterPage = pageName;
      select.dataset.filterIndex = String(config.index);

      const allOption = document.createElement("option");
      allOption.value = "";
      allOption.textContent = "全部";
      select.appendChild(allOption);

      valuesForColumn(config.index, config.type).forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });

      select.value = state[pageName][config.index] || "";
      select.addEventListener("change", () => {
        state[pageName][config.index] = select.value;
        NT_RENDER.renderAll();
      });

      field.append(title, select);
      container.appendChild(field);
    });

    const summary = document.createElement("div");
    summary.className = "nt-active-filter-summary";
    summary.id = `filter-summary-${pageName}`;
    container.appendChild(summary);

    updateSummary(pageName);
  }

  function updateSummary(pageName) {
    const box = document.getElementById(`filter-summary-${pageName}`);
    if (!box) return;

    const active = PAGE_CONFIG[pageName]
      .map(config => {
        const value = state[pageName][config.index];
        return value ? `${config.label}：${value}` : "";
      })
      .filter(Boolean);

    box.textContent = active.length ? `目前篩選：${active.join("｜")}` : "目前未套用篩選";
  }

  function matchesCategory(cell, expected) {
    return text(cell).split(",").map(item => item.trim()).includes(expected);
  }

  function matchesPage(row, pageName) {
    const filters = state[pageName];

    return Object.entries(filters).every(([indexText, expected]) => {
      if (!expected) return true;
      const index = Number(indexText);
      const config = PAGE_CONFIG[pageName].find(item => item.index === index);
      const cell = row[index];

      if (config?.type === "category") {
        return matchesCategory(cell, expected);
      }

      return text(cell) === expected;
    });
  }

  function filterEntries(entries, pageName) {
    return entries.filter(entry => matchesPage(entry.row, pageName));
  }

  function clear(pageName) {
    state[pageName] = {};
    buildControls(pageName);
    NT_RENDER.renderAll();
  }

  function clearAll() {
    Object.keys(state).forEach(pageName => {
      state[pageName] = {};
      buildControls(pageName);
    });
    NT_RENDER.renderAll();
  }

  function togglePanel(pageName) {
    const panel = document.getElementById(`filter-panel-${pageName}`);
    if (!panel) return;

    panel.hidden = !panel.hidden;
    if (!panel.hidden) buildControls(pageName);
  }

  function refreshOptions() {
    Object.keys(PAGE_CONFIG).forEach(pageName => buildControls(pageName));
  }

  function initialize() {
    document.querySelectorAll("[data-filter-panel]").forEach(button => {
      button.addEventListener("click", () => togglePanel(button.dataset.filterPanel));
    });

    document.querySelectorAll("[data-clear-filter]").forEach(button => {
      button.addEventListener("click", () => clear(button.dataset.clearFilter));
    });

    refreshOptions();
  }

  window.NT_FILTER = {
    apply: filterEntries,
    refreshOptions,
    clear,
    clearAll,
    getState: pageName => ({ ...state[pageName] })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

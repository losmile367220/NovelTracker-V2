(() => {
  const DATA_KEY = "novel_tableData";
  const CATEGORY_KEY = "novel_categories";

  const DEFAULT_ROWS = [[
    "穿越, 空間", "我的夫君柔弱自理", "勤不語", "姜重華", "月般般",
    "281", "完結", "-", "醫妃駕到：我的夫君柔弱自理",
    "月般般", "姜晏辭", "第五季", "完結"
  ]];

  const DEFAULT_CATEGORIES = [
    "穿越","空間","系統","重生","報仇","異能","奇幻","獸世","多夫",
    "穿書","古代","現代","瘋批","宮鬥","萌寶","祭品","豪門總裁","修真"
  ];

  const parse = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const normalizeRows = rows => {
    if (!Array.isArray(rows)) return [];
    return rows.filter(Array.isArray).map(row => {
      const normalized = row.slice(0, 13);
      while (normalized.length < 13) normalized.push("");
      return normalized.map(value => value == null ? "" : String(value));
    });
  };

  let rows = normalizeRows(parse(DATA_KEY, DEFAULT_ROWS));
  if (!rows.length) rows = normalizeRows(DEFAULT_ROWS);

  let categories = parse(CATEGORY_KEY, DEFAULT_CATEGORIES);
  if (!Array.isArray(categories) || !categories.length) categories = [...DEFAULT_CATEGORIES];

  function extractCategories() {
    rows.forEach(row => {
      String(row[0] || "").split(",").map(v => v.trim()).filter(Boolean).forEach(cat => {
        if (cat !== "-" && !categories.includes(cat)) categories.push(cat);
      });
    });
  }

  function save() {
    localStorage.setItem(DATA_KEY, JSON.stringify(rows));
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  }

  extractCategories();
  save();

  window.NT_STORE = {
    getRows: () => rows,
    getCategories: () => categories,
    setRows(nextRows) {
      rows = normalizeRows(nextRows);
      extractCategories();
      save();
    },
    addRow(row) {
      rows.push(normalizeRows([row])[0]);
      extractCategories();
      save();
    },
    updateRow(index, row) {
      if (!Number.isInteger(index) || !rows[index]) return false;
      rows[index] = normalizeRows([row])[0];
      extractCategories();
      save();
      return true;
    },
    deleteRow(index) {
      if (!Number.isInteger(index) || !rows[index]) return false;
      rows.splice(index, 1);
      save();
      return true;
    },
    addCategory(category) {
      const value = String(category || "").trim();
      if (!value || value.includes(",") || categories.includes(value)) return false;
      categories.push(value);
      save();
      return true;
    },
    removeCategory(category) {
      if (categories.length <= 1) return false;
      categories = categories.filter(item => item !== category);
      save();
      return true;
    },
    save
  };
})();

(() => {
  const text = value => value == null ? "" : String(value).trim();
  const hasValue = value => text(value) !== "" && text(value) !== "-";
  const isCompleted = value => text(value).includes("完結");

  function percent(done, total) {
    return total ? Math.round(done / total * 100) : 0;
  }

  function renderDashboard() {
    const rows = NT_STORE.getRows();
    const novelRows = rows.filter(row => hasValue(row[1]));
    const dramaRows = rows.filter(row => hasValue(row[8]));
    const novelDone = novelRows.filter(row => isCompleted(row[6])).length;
    const dramaDone = dramaRows.filter(row => isCompleted(row[12])).length;
    const completed = novelDone + dramaDone;

    document.getElementById("stat-novels").textContent = novelRows.length;
    document.getElementById("stat-dramas").textContent = dramaRows.length;
    document.getElementById("stat-completed").textContent = completed;

    const novelPercent = percent(novelDone, novelRows.length);
    const dramaPercent = percent(dramaDone, dramaRows.length);
    const allPercent = percent(completed, novelRows.length + dramaRows.length);

    [
      ["novel", novelPercent],
      ["drama", dramaPercent],
      ["all", allPercent]
    ].forEach(([name, value]) => {
      document.getElementById(`${name}-progress-text`).textContent = `${value}%`;
      document.getElementById(`${name}-progress-bar`).style.width = `${value}%`;
    });

    const counts = new Map();
    rows.forEach(row => {
      text(row[0]).split(",").map(v => v.trim()).filter(v => v && v !== "-").forEach(cat => {
        counts.set(cat, (counts.get(cat) || 0) + 1);
      });
    });

    const stats = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"));
    const box = document.getElementById("category-stats");
    box.innerHTML = "";

    if (!stats.length) {
      box.innerHTML = '<div><span>尚無分類資料</span><strong>0</strong></div>';
      return;
    }

    stats.slice(0, 10).forEach(([category, count]) => {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const value = document.createElement("strong");
      name.textContent = category;
      value.textContent = count;
      row.append(name, value);
      box.appendChild(row);
    });
  }

  window.NT_DASHBOARD = { render: renderDashboard };
})();

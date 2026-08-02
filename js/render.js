(() => {
  const text = value => value == null ? "" : String(value).trim();
  const shown = value => text(value) || "-";
  const hasNovel = row => row.slice(1, 8).some(v => text(v) && text(v) !== "-");
  const hasDrama = row => row.slice(8, 13).some(v => text(v) && text(v) !== "-");

  function tagsElement(value) {
    const box = document.createElement("div");
    box.className = "nt-tags";
    text(value).split(",").map(v => v.trim()).filter(Boolean).forEach(cat => {
      const badge = document.createElement("span");
      badge.textContent = cat;
      box.appendChild(badge);
    });
    return box;
  }

  function actionButtons(index) {
    const actions = document.createElement("div");
    actions.className = "nt-card-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "nt-mini-btn nt-edit-btn";
    edit.textContent = "✏️ 編輯";
    edit.addEventListener("click", () => NT_APP.editRow(index));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "nt-mini-btn nt-delete-btn";
    del.textContent = "🗑️ 刪除";
    del.addEventListener("click", () => NT_APP.deleteRow(index));

    actions.append(edit, del);
    return actions;
  }

  function metaGrid(items) {
    const grid = document.createElement("div");
    grid.className = "nt-meta-grid";
    items.forEach(([label, value]) => {
      const item = document.createElement("div");
      const b = document.createElement("b");
      const span = document.createElement("span");
      b.textContent = label;
      span.textContent = shown(value);
      item.append(b, span);
      grid.appendChild(item);
    });
    return grid;
  }

  function renderOverview() {
    const list = document.getElementById("overview-list");
    list.innerHTML = "";
    const rows = NT_STORE.getRows();

    rows.forEach((row, index) => {
      const card = document.createElement("article");
      card.className = "nt-content-card";
      card.dataset.recordIndex = index;
      card.appendChild(tagsElement(row[0]));

      if (hasNovel(row)) {
        const block = document.createElement("div");
        block.className = "nt-dual-block nt-novel-block";
        block.innerHTML = `<small>📖 小說</small><h3></h3><p></p><p></p>`;
        block.querySelector("h3").textContent = shown(row[1]);
        block.querySelectorAll("p")[0].textContent = `作者：${shown(row[2])}`;
        block.querySelectorAll("p")[1].textContent = `${shown(row[5])} 章 · ${shown(row[6])}`;
        card.appendChild(block);
      }

      if (hasNovel(row) && hasDrama(row)) {
        const divider = document.createElement("div");
        divider.className = "nt-dual-divider";
        card.appendChild(divider);
      }

      if (hasDrama(row)) {
        const block = document.createElement("div");
        block.className = "nt-dual-block nt-drama-block";
        block.innerHTML = `<small>🎥 短劇</small><h3></h3><p></p>`;
        block.querySelector("h3").textContent = shown(row[8]);
        block.querySelector("p").textContent = `${shown(row[11])} · ${shown(row[12])}`;
        card.appendChild(block);
      }

      card.appendChild(actionButtons(index));
      list.appendChild(card);
    });

    if (!rows.length) list.innerHTML = '<div class="nt-empty">尚無追蹤資料。</div>';
  }

  function renderNovels() {
    const list = document.getElementById("novel-list");
    list.innerHTML = "";

    NT_STORE.getRows().forEach((row, index) => {
      if (!hasNovel(row)) return;
      const card = document.createElement("article");
      card.className = "nt-content-card nt-novel-card";
      card.dataset.recordIndex = index;
      card.appendChild(tagsElement(row[0]));

      const small = document.createElement("small");
      small.textContent = "📖 小說";
      const title = document.createElement("h3");
      title.textContent = shown(row[1]);
      const author = document.createElement("p");
      author.textContent = `作者：${shown(row[2])}`;

      card.append(small, title, author, metaGrid([
        ["男主角", row[3]], ["女主角", row[4]],
        ["章節", row[5]], ["狀態", row[6]], ["TXT／備註", row[7]]
      ]), actionButtons(index));
      list.appendChild(card);
    });

    if (!list.children.length) list.innerHTML = '<div class="nt-empty">尚無小說資料。</div>';
  }

  function renderDramas() {
    const list = document.getElementById("drama-list");
    list.innerHTML = "";

    NT_STORE.getRows().forEach((row, index) => {
      if (!hasDrama(row)) return;
      const card = document.createElement("article");
      card.className = "nt-content-card nt-drama-card";
      card.dataset.recordIndex = index;
      card.appendChild(tagsElement(row[0]));

      const small = document.createElement("small");
      small.textContent = "🎥 短劇";
      const title = document.createElement("h3");
      title.textContent = shown(row[8]);

      card.append(small, title, metaGrid([
        ["男主角", row[9]], ["女主角", row[10]],
        ["進度", row[11]], ["狀態", row[12]]
      ]), actionButtons(index));
      list.appendChild(card);
    });

    if (!list.children.length) list.innerHTML = '<div class="nt-empty">尚無短劇資料。</div>';
  }

  function renderAll() {
    renderOverview();
    renderNovels();
    renderDramas();
    NT_DASHBOARD.render();
  }

  window.NT_RENDER = { renderAll };
})();

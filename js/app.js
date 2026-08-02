(() => {
  const FIELD_IDS = [
    "novelName","author","novelML","novelFL","chapter","novelStatus","txtLink",
    "dramaName","dramaML","dramaFL","dramaProgress","dramaStatus"
  ];

  const text = value => value == null ? "" : String(value).trim();

  function selectedCategories() {
    return text(document.getElementById("category").value)
      .split(",").map(v => v.trim()).filter(Boolean);
  }

  function renderFormCategories() {
    const box = document.getElementById("form-category-tags");
    const selected = selectedCategories();
    box.innerHTML = "";

    NT_STORE.getCategories().forEach(cat => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = cat;
      button.classList.toggle("active", selected.includes(cat));
      button.addEventListener("click", () => {
        const next = selectedCategories();
        const index = next.indexOf(cat);
        if (index >= 0) next.splice(index, 1);
        else next.push(cat);
        document.getElementById("category").value = next.join(", ");
        renderFormCategories();
      });
      box.appendChild(button);
    });
  }

  function renderCategoryManager() {
    const box = document.getElementById("category-manage-list");
    box.innerHTML = "";

    NT_STORE.getCategories().forEach(cat => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "nt-category-chip";
      chip.textContent = `${cat} ×`;
      chip.title = `移除分類 ${cat}`;
      chip.addEventListener("click", () => {
        if (!confirm(`確定要從分類清單移除「${cat}」嗎？既有資料中的分類文字不會被刪除。`)) return;
        if (!NT_STORE.removeCategory(cat)) {
          alert("至少需要保留一個分類。");
          return;
        }
        renderFormCategories();
        renderCategoryManager();
      });
      box.appendChild(chip);
    });
  }

  function resetForm() {
    document.getElementById("tracker-form").reset();
    document.getElementById("edit-index").value = "";
    document.getElementById("category").value = NT_STORE.getCategories()[0] || "";
    document.getElementById("form-heading").textContent = "新增小說＋短劇";
    document.getElementById("submit-btn").textContent = "儲存追蹤項目";
    document.getElementById("cancel-edit-btn").hidden = true;
    renderFormCategories();
  }

  function saveForm(event) {
    event.preventDefault();

    const novelName = document.getElementById("novelName").value.trim();
    const dramaName = document.getElementById("dramaName").value.trim();
    if (!novelName && !dramaName) {
      alert("請至少輸入小說名稱或短劇名稱。");
      return;
    }

    const category = text(document.getElementById("category").value) || NT_STORE.getCategories()[0] || "未分類";
    const row = [category, ...FIELD_IDS.map(id => document.getElementById(id).value.trim())];
    const editValue = document.getElementById("edit-index").value;

    if (editValue === "") NT_STORE.addRow(row);
    else NT_STORE.updateRow(Number(editValue), row);

    resetForm();
    renderCategoryManager();
    NT_RENDER.renderAll();
    NT_UI.showPage("overview");
    alert("資料已儲存至本機。");
  }

  function editRow(index) {
    const row = NT_STORE.getRows()[index];
    if (!row) return;

    document.getElementById("category").value = text(row[0]);
    FIELD_IDS.forEach((id, fieldIndex) => {
      const value = text(row[fieldIndex + 1]);
      document.getElementById(id).value = value === "-" ? "" : value;
    });

    document.getElementById("edit-index").value = String(index);
    document.getElementById("form-heading").textContent = "修改小說＋短劇";
    document.getElementById("submit-btn").textContent = "儲存修改";
    document.getElementById("cancel-edit-btn").hidden = false;
    renderFormCategories();
    NT_UI.showPage("add");
  }

  function deleteRow(index) {
    const row = NT_STORE.getRows()[index];
    if (!row) return;
    const name = text(row[1]) || text(row[8]) || "這筆資料";
    if (!confirm(`確定要刪除「${name}」嗎？`)) return;
    NT_STORE.deleteRow(index);
    NT_RENDER.renderAll();
  }

  function addCategory() {
    const input = document.getElementById("new-category-input");
    const value = input.value.trim();
    if (!value) return;

    if (!NT_STORE.addCategory(value)) {
      alert(value.includes(",") ? "分類名稱不能包含逗號。" : "分類已存在或內容無效。");
      return;
    }

    input.value = "";
    renderFormCategories();
    renderCategoryManager();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tracker-form").addEventListener("submit", saveForm);
    document.getElementById("tracker-form").addEventListener("reset", () => setTimeout(resetForm, 0));
    document.getElementById("cancel-edit-btn").addEventListener("click", resetForm);
    document.getElementById("add-category-btn").addEventListener("click", addCategory);
    document.getElementById("new-category-input").addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategory();
      }
    });

    resetForm();
    renderCategoryManager();
    NT_RENDER.renderAll();
    console.log("NovelTracker V2.1 Data loaded.");
  });

  window.NT_APP = { editRow, deleteRow, resetForm };
})();

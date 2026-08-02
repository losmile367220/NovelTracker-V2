(() => {
  "use strict";

  const FIELD_IDS = [
    "novelName","author","novelML","novelFL","chapter","novelStatus","txtLink",
    "dramaName","dramaML","dramaFL","dramaProgress","dramaStatus"
  ];

  const text = value => value == null ? "" : String(value).trim();

  function requiredElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`找不到網頁元件：${id}`);
    return element;
  }

  function selectedCategories() {
    return text(requiredElement("category").value)
      .split(",")
      .map(value => value.trim())
      .filter(Boolean);
  }

  function renderFormCategories() {
    const box = requiredElement("form-category-tags");
    const selected = selectedCategories();
    box.innerHTML = "";

    NT_STORE.getCategories().forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = category;
      button.classList.toggle("active", selected.includes(category));

      button.addEventListener("click", () => {
        const next = selectedCategories();
        const index = next.indexOf(category);

        if (index >= 0) next.splice(index, 1);
        else next.push(category);

        requiredElement("category").value = next.join(", ");
        renderFormCategories();
      });

      box.appendChild(button);
    });
  }

  function renderCategoryManager() {
    const box = requiredElement("category-manage-list");
    box.innerHTML = "";

    NT_STORE.getCategories().forEach(category => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "nt-category-chip";
      chip.textContent = `${category} ×`;
      chip.title = `移除分類 ${category}`;

      chip.addEventListener("click", () => {
        if (!confirm(`確定要從分類清單移除「${category}」嗎？既有資料中的分類文字不會被刪除。`)) return;

        if (!NT_STORE.removeCategory(category)) {
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
    const form = requiredElement("tracker-form");
    form.reset();

    requiredElement("edit-index").value = "";
    requiredElement("category").value = NT_STORE.getCategories()[0] || "";
    requiredElement("form-heading").textContent = "新增小說＋短劇";
    requiredElement("submit-btn").textContent = "儲存追蹤項目";
    requiredElement("cancel-edit-btn").hidden = true;
    renderFormCategories();
  }

  function saveForm(event) {
    event.preventDefault();

    try {
      const novelName = requiredElement("novelName").value.trim();
      const dramaName = requiredElement("dramaName").value.trim();

      if (!novelName && !dramaName) {
        alert("請至少輸入小說名稱或短劇名稱。");
        return;
      }

      const category =
        text(requiredElement("category").value) ||
        NT_STORE.getCategories()[0] ||
        "未分類";

      const row = [
        category,
        ...FIELD_IDS.map(id => requiredElement(id).value.trim())
      ];

      const editValue = requiredElement("edit-index").value;
      let succeeded = false;

      if (editValue === "") {
        NT_STORE.addRow(row);
        succeeded = true;
      } else {
        succeeded = NT_STORE.updateRow(Number(editValue), row);
      }

      if (!succeeded) {
        throw new Error("資料沒有成功寫入儲存區。");
      }

      // 先完整重新渲染，再清空表單，確保新資料立刻出現在三個總覽。
      NT_RENDER.renderAll();
      renderCategoryManager();
      resetForm();
      NT_UI.showPage("overview");

      alert(`儲存成功！目前共有 ${NT_STORE.getRows().length} 筆資料。`);
    } catch (error) {
      console.error("儲存失敗：", error);
      alert(`儲存失敗：${error.message}`);
    }
  }

  function editRow(index) {
    const row = NT_STORE.getRows()[index];
    if (!row) {
      alert("找不到這筆資料，請重新整理後再試。");
      return;
    }

    requiredElement("category").value = text(row[0]);

    FIELD_IDS.forEach((id, fieldIndex) => {
      const value = text(row[fieldIndex + 1]);
      requiredElement(id).value = value === "-" ? "" : value;
    });

    requiredElement("edit-index").value = String(index);
    requiredElement("form-heading").textContent = "修改小說＋短劇";
    requiredElement("submit-btn").textContent = "儲存修改";
    requiredElement("cancel-edit-btn").hidden = false;

    renderFormCategories();
    NT_UI.showPage("add");
  }

  function deleteRow(index) {
    const row = NT_STORE.getRows()[index];
    if (!row) return;

    const name = text(row[1]) || text(row[8]) || "這筆資料";
    if (!confirm(`確定要刪除「${name}」嗎？`)) return;

    if (!NT_STORE.deleteRow(index)) {
      alert("刪除失敗，請重新整理後再試。");
      return;
    }

    NT_RENDER.renderAll();
  }

  function addCategory() {
    try {
      const input = requiredElement("new-category-input");
      const value = input.value.trim();

      if (!value) {
        alert("請先輸入分類名稱。");
        return;
      }

      if (!NT_STORE.addCategory(value)) {
        alert(value.includes(",")
          ? "分類名稱不能包含逗號。"
          : "分類已存在或內容無效。");
        return;
      }

      input.value = "";
      renderFormCategories();
      renderCategoryManager();
      NT_DASHBOARD.render();

      alert(`分類「${value}」新增成功。`);
    } catch (error) {
      console.error("新增分類失敗：", error);
      alert(`新增分類失敗：${error.message}`);
    }
  }

  function initialize() {
    try {
      requiredElement("tracker-form").addEventListener("submit", saveForm);
      requiredElement("cancel-edit-btn").addEventListener("click", resetForm);

      const resetButton = document.querySelector('#tracker-form button[type="reset"]');
      if (resetButton) {
        resetButton.addEventListener("click", event => {
          event.preventDefault();
          resetForm();
        });
      }

      requiredElement("add-category-btn").addEventListener("click", addCategory);
      requiredElement("new-category-input").addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          addCategory();
        }
      });

      resetForm();
      renderCategoryManager();
      NT_RENDER.renderAll();

      console.log("NovelTracker V2.1.3 Save Fix loaded.");
    } catch (error) {
      console.error("NovelTracker 初始化失敗：", error);
      alert(`網頁初始化失敗：${error.message}`);
    }
  }

  function refreshCategoryUI() {
    renderFormCategories();
    renderCategoryManager();
  }

  window.NT_APP = {
    editRow,
    deleteRow,
    resetForm,
    refreshCategoryUI
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

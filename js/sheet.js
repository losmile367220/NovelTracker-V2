(() => {
  "use strict";

  const GAS_URL_KEY = "gas_url";
  const LAST_CLOUD_DOWNLOAD_KEY = "novel_last_cloud_download";
  const LAST_CLOUD_UPLOAD_KEY = "novel_last_cloud_upload";

  let uploadPending = false;
  let uploadStartedAt = 0;

  const get = id => document.getElementById(id);
  const text = value => value == null ? "" : String(value).trim();

  function validUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        (url.hostname === "script.google.com" ||
         url.hostname.endsWith(".googleusercontent.com"));
    } catch {
      return false;
    }
  }

  function setStatus(message, type = "info", clearAfter = 0) {
    const element = get("sync-status");
    if (!element) return;

    element.className = `nt-sync-status ${type}`;
    element.textContent = message;

    if (clearAfter) {
      window.setTimeout(() => {
        if (element.textContent === message) {
          element.textContent = "";
          element.className = "nt-sync-status";
        }
      }, clearAfter);
    }
  }

  function formatTime(isoValue) {
    if (!isoValue) return "尚無紀錄";

    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return "尚無紀錄";

    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  function renderCloudInfo() {
    const box = get("cloud-info");
    if (!box) return;

    const downloaded = localStorage.getItem(LAST_CLOUD_DOWNLOAD_KEY);
    const uploaded = localStorage.getItem(LAST_CLOUD_UPLOAD_KEY);

    box.innerHTML = "";

    const downloadLine = document.createElement("div");
    downloadLine.textContent = `最近從雲端下載：${formatTime(downloaded)}`;

    const uploadLine = document.createElement("div");
    uploadLine.textContent = `最近備份至雲端：${formatTime(uploaded)}`;

    box.append(downloadLine, uploadLine);
  }

  function saveGasUrl(showMessage = true) {
    const input = get("gas-url");
    const url = text(input?.value);

    if (!url) {
      setStatus("請先輸入 Apps Script 網址。", "error");
      return false;
    }

    if (!validUrl(url)) {
      setStatus("網址格式不正確，請貼上 Apps Script 部署後的 /exec 網址。", "error");
      return false;
    }

    localStorage.setItem(GAS_URL_KEY, url);

    if (showMessage) {
      setStatus("Apps Script 網址已儲存在這台裝置。", "success", 2800);
    }

    return true;
  }

  function getGasUrl() {
    const input = get("gas-url");
    const typed = text(input?.value);
    const saved = text(localStorage.getItem(GAS_URL_KEY));
    return typed || saved;
  }

  function normalizeCloudRows(data) {
    if (!Array.isArray(data)) {
      throw new Error("雲端回傳的資料格式不是陣列。");
    }

    return data
      .filter(Array.isArray)
      .map(row => {
        const normalized = row.slice(0, 13);
        while (normalized.length < 13) normalized.push("");
        return normalized.map(value => value == null ? "" : String(value));
      });
  }

  async function downloadFromCloud() {
    if (!saveGasUrl(false)) return;

    const url = getGasUrl();
    const localCount = NT_STORE.getRows().length;

    if (!confirm(
      `將以 Google Sheet 的內容及順序覆蓋網頁目前 ${localCount} 筆本機資料。\n\n確定要從雲端下載嗎？`
    )) {
      return;
    }

    const button = get("download-cloud-btn");
    if (button) button.disabled = true;
    setStatus("正在從 Google Sheet 下載資料…", "loading");

    try {
      const separator = url.includes("?") ? "&" : "?";
      const response = await fetch(`${url}${separator}_=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = normalizeCloudRows(await response.json());

      if (data.length === 0) {
        const overwriteWithEmpty = confirm(
          "Google Sheet 目前沒有任何資料。\n\n要將網頁資料也清空嗎？"
        );

        if (!overwriteWithEmpty) {
          setStatus("已取消下載，網頁資料未變更。", "info", 3000);
          return;
        }
      }

      // Google Sheet is the source of truth: retain exact row order.
      NT_STORE.setRows(data);

      if (window.NT_FILTER?.clearAll) {
        NT_FILTER.clearAll();
      } else {
        NT_RENDER.renderAll();
      }

      window.NT_APP?.refreshCategoryUI?.();
      window.NT_SEARCH?.close?.();

      const now = new Date().toISOString();
      localStorage.setItem(LAST_CLOUD_DOWNLOAD_KEY, now);
      renderCloudInfo();

      setStatus(
        `下載成功！已依照 Google Sheet 的順序載入 ${data.length} 筆資料。`,
        "success",
        5000
      );
    } catch (error) {
      console.error("Google Sheets 下載失敗：", error);
      setStatus(
        `下載失敗：${error.message}。請檢查 Apps Script 網址與部署存取權限。`,
        "error"
      );
    } finally {
      if (button) button.disabled = false;
    }
  }

  function uploadToCloud() {
    if (!saveGasUrl(false)) return;

    const url = getGasUrl();
    const rows = NT_STORE.getRows();
    const count = rows.length;

    if (!confirm(
      `將以網頁目前 ${count} 筆資料及順序，覆蓋 Google Sheet 第 3 列之後的內容。\n\n確定要備份至雲端嗎？`
    )) {
      return;
    }

    const button = get("upload-cloud-btn");
    if (button) button.disabled = true;

    setStatus("正在將網頁資料送往 Google Sheet…", "loading");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = "nt-cloud-upload-frame";
    form.style.display = "none";
    form.acceptCharset = "UTF-8";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(rows);

    form.appendChild(input);
    document.body.appendChild(form);

    uploadPending = true;
    uploadStartedAt = Date.now();
    form.submit();
    form.remove();

    // Safety fallback in case the iframe load event is blocked by the browser.
    window.setTimeout(() => {
      if (!uploadPending) return;

      uploadPending = false;
      if (button) button.disabled = false;

      const now = new Date().toISOString();
      localStorage.setItem(LAST_CLOUD_UPLOAD_KEY, now);
      renderCloudInfo();

      setStatus(
        "資料已送往 Google Sheet。請稍候數秒後查看試算表確認寫入結果。",
        "success",
        5500
      );
    }, 4500);
  }

  function handleUploadFrameLoad() {
    // Ignore the iframe's initial about:blank load.
    if (!uploadPending || Date.now() - uploadStartedAt < 250) return;

    uploadPending = false;

    const button = get("upload-cloud-btn");
    if (button) button.disabled = false;

    const now = new Date().toISOString();
    localStorage.setItem(LAST_CLOUD_UPLOAD_KEY, now);
    renderCloudInfo();

    setStatus(
      `備份封包已送達 Google Apps Script，共 ${NT_STORE.getRows().length} 筆資料。`,
      "success",
      5000
    );
  }

  function initialize() {
    const savedUrl = localStorage.getItem(GAS_URL_KEY);
    if (savedUrl && get("gas-url")) {
      get("gas-url").value = savedUrl;
    }

    get("save-gas-url-btn")?.addEventListener("click", () => saveGasUrl(true));
    get("download-cloud-btn")?.addEventListener("click", downloadFromCloud);
    get("upload-cloud-btn")?.addEventListener("click", uploadToCloud);
    get("nt-cloud-upload-frame")?.addEventListener("load", handleUploadFrameLoad);

    get("gas-url")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveGasUrl(true);
      }
    });

    renderCloudInfo();
  }

  window.NT_SHEET = {
    saveGasUrl,
    downloadFromCloud,
    uploadToCloud
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

# NovelTracker V2.6.1 Stable

以 GitHub Pages、Google Sheets 與 Google Apps Script 建立的小說／短劇追蹤看板。

## 功能

- Dashboard：小說、短劇、已完結、進度與分類統計
- 小說＋短劇總覽、小說總覽、短劇總覽
- 小說＋短劇同一筆新增
- 編輯、刪除與刪除確認視窗
- 分類新增、移除與篩選
- 進階欄位篩選
- 浮動搜尋、上一個與下一個
- Google Sheets 手動雙向同步
- 桌機左側導覽與手機底部導覽
- localStorage 本機儲存
- 保留 Google Sheet 列順序

## 專案結構

```text
index.html
css/style.css
js/
  app.js
  dashboard.js
  filter.js
  render.js
  search.js
  sheet.js
  storage.js
  ui.js
images/
  logo.svg
  favicon.ico
NovelTrackerV2.gs
README.md
CHANGELOG.md
ROADMAP.md
LICENSE
```

## Google Sheet 欄位

資料從第 3 列開始，A 到 M 共 13 欄：

1. 分類
2. 小說名稱
3. 作者
4. 小說男主角
5. 小說女主角
6. 章節
7. 小說完結
8. TXT／備註
9. 短劇名稱
10. 短劇男主角
11. 短劇女主角
12. 進度
13. 短劇完結

## 安裝

1. 建立 Google Sheet，前兩列作為標題，資料從第 3 列開始。
2. 開啟「擴充功能 → Apps Script」。
3. 將 `NovelTrackerV2.gs` 貼入並儲存。
4. 部署為網頁應用程式：
   - 執行身分：我
   - 誰可以存取：任何人
5. 複製 `/exec` 網址。
6. 將本專案上傳到 GitHub Repository 根目錄。
7. 在 GitHub Settings → Pages 設定 `main` 與 `/ (root)`。
8. 開啟網站，到「更多 → Google Sheets 雙向同步」，貼上 `/exec` 網址。

## 同步方向

- 從雲端下載：Google Sheet → 網頁
- 備份至雲端：網頁 → Google Sheet

同步會完整覆蓋目的地資料，因此操作前會要求確認。

## 注意事項

- V1 與 V2 網址不同時，localStorage 不會共用。
- 網頁刪除後，要按「備份至雲端」，Sheet 才會同步刪除。
- 在 Sheet 調整順序後，按「從雲端下載」，網頁會依列順序更新。
- 若 GitHub Pages 顯示舊畫面，電腦按 `Ctrl + F5`；手機關閉頁面後重新開啟。

## 版本

**NovelTracker V2.6.1 Stable**

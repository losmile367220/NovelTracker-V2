# NovelTracker V2.5 Google Sheets

## 本版完成
- 儲存 Apps Script 網址
- Google Sheet → 網頁下載
- 網頁 → Google Sheet 備份
- 下載後以 Google Sheet 的內容及列順序為準
- 上傳後以網頁的內容及順序為準
- 支援兩邊新增、修改、刪除及調整順序
- 同步前顯示覆蓋方向與確認提示
- Google Sheet 空白時，可選擇是否將網頁資料清空
- 同步完成後重新渲染 Dashboard、總覽、小說、短劇、分類與篩選
- 顯示最近下載及最近上傳時間
- 保留原本 13 欄資料格式

## 同步方式
這是手動雙向同步，不會自動合併兩邊的差異：

- 從雲端下載：Google Sheet → 網頁
- 備份至雲端：網頁 → Google Sheet

同步時，被選為目的地的一方會被完整覆蓋。

## Apps Script
壓縮包中附有 `GoogleAppsScript.gs`。

若目前的 Apps Script 已能正常搭配 V1 使用，可以先沿用原本網址。
新版 `.gs` 主要改善：
- 固定從第 3 列讀取
- 固定處理 A:M 共 13 欄
- 支援空陣列清空雲端資料
- 回傳寫入筆數

修改 Apps Script 後，請重新部署網頁應用程式，再將新的 `/exec` 網址存入 V2。

## 更新 GitHub
將 ZIP 解壓後，把全部內容覆蓋到 `NovelTracker-V2` Repository 根目錄，再 Commit。

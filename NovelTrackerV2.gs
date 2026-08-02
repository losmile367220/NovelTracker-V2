/**
 * NovelTracker V2.5 - Google Apps Script
 *
 * 試算表格式：
 * 第 1、2 列保留標題；資料從第 3 列開始，共 13 欄（A:M）。
 *
 * 部署：
 * 「部署」→「新增部署作業」→「網頁應用程式」
 * 執行身分：我
 * 誰可以存取：任何人
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    var rows = sheet.getDataRange().getValues();
    var data = [];

    for (var i = 2; i < rows.length; i++) {
      var row = rows[i].slice(0, 13);
      var hasContent = row.some(function(cell) {
        return cell !== "" && cell !== null && cell !== undefined;
      });

      if (hasContent) {
        data.push(row);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    var rawData = "";

    if (e.parameter && e.parameter.data) {
      rawData = e.parameter.data;
    } else if (e.postData && e.postData.contents) {
      var contents = e.postData.contents;

      if (contents.indexOf("data=") === 0) {
        rawData = decodeURIComponent(contents.substring(5).replace(/\+/g, " "));
      } else {
        rawData = contents;
      }
    }

    var jsonData = JSON.parse(rawData || "[]");

    if (!Array.isArray(jsonData)) {
      throw new Error("接收到的資料不是陣列。");
    }

    var normalized = jsonData.map(function(row) {
      var result = Array.isArray(row) ? row.slice(0, 13) : [];

      while (result.length < 13) {
        result.push("");
      }

      return result;
    });

    var lastRow = sheet.getLastRow();

    if (lastRow > 2) {
      sheet.getRange(3, 1, lastRow - 2, 13).clearContent();
    }

    if (normalized.length > 0) {
      sheet.getRange(3, 1, normalized.length, 13).setValues(normalized);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        count: normalized.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

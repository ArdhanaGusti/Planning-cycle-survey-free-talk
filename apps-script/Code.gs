// Google Apps Script: bound to your Google Sheet (Extensions > Apps Script).
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Messages") || ss.insertSheet("Messages");
  if (sheet.getLastRow() === 0) sheet.appendRow(["Timestamp", "Name", "Message"]);
  sheet.appendRow([new Date(), data.name, data.message]);
  return ContentService.createTextOutput("ok");
}

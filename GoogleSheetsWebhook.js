// || Made by ||
/*
 ____       _   _  __     __
/ ___|  ___| |_| |_\ \   / /
\___ \ / _ \ __| '_ \ \ / / 
 ___) |  __/ |_| | | \ V /  
|____/ \___|\__|_| |_|\_/   
 */
function sendtodiscord() {
 const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SHEET_NAME");
 if (!sheet) {
  Logger.log("Sheet not found!");
  return;
 }

 const serverUrl = "HOSTING_SERVER_URL/convert";
 const discordWebhookUrl = "WEBHOOK_URL";

 try {
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const exportUrl =
   `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?` +
   `exportFormat=pdf&` +
   `format=pdf&` +
   `size=letter&` +
   `portrait=false&` +
   `fitw=true&` +
   `gridlines=true&` +
   `printtitle=false&` +
   `sheetnames=false&` +
   `pagenum=false&` +
   `gid=${sheet.getSheetId()}`;

  const response = UrlFetchApp.fetch(exportUrl, {
   headers: {
    Authorization: "Bearer " + ScriptApp.getOAuthToken(),
   },
   muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
   Logger.log("Failed to export sheet: " + response.getContentText());
   return;
  }

  const serverOptions = {
   method: "POST",
   payload: {
    pdf: response.getBlob(),
    webhookUrl: discordWebhookUrl,
    message: "📊 **Top 10 Model Plays** 🕒",
   },
   muteHttpExceptions: true,
  };

  const serverResponse = UrlFetchApp.fetch(serverUrl, serverOptions);

  if (serverResponse.getResponseCode() === 200) {
   Logger.log("Successfully sent to conversion server");
  } else {
   Logger.log("Failed to send to server: " + serverResponse.getContentText());
  }
 } catch (error) {
  Logger.log("Error: " + error.toString());
 }
}

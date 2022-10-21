import { settingsStorage } from "settings";

function loadSettings() {
  const retentionPeriod = loadRetentionPeriod();
  const thresholdHigh = settingsStorage.getItem("thresholdHigh");
  const thresholdLow = settingsStorage.getItem("thresholdLow");
  const sendHttp = settingsStorage.getItem("sendHttp");
  const sendUrl = settingsStorage.getItem("sendUrl");
  
  return { retentionPeriod, thresholdHigh, thresholdLow, sendHttp, sendUrl };
}

function loadRetentionPeriod() {
  const str  = settingsStorage.getItem("retentionPeriod");
  const defaultValue = 600;
  
  if (!str || !isJSON(str)) {
    return defaultValue;
  }

  const item = JSON.parse(str);

  if (!item || !item.name) {
    return defaultValue;
  }

  const value = parseInt(item.name, 10);
  
  if (!value) {
    return defaultValue;
  }
  
  return value;
}

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (_) {
    return false;
  }
}

console.log(loadSettings());



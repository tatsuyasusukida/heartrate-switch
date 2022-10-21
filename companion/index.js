import { settingsStorage } from "settings";

console.log(loadSettings());

function loadSettings() {
  const retentionPeriod = loadRetentionPeriod();
  const thresholdHigh = loadThresholdHigh();
  const thresholdLow = loadThresholdLow();
  const sendHttp = settingsStorage.getItem("sendHttp");
  const sendUrl = settingsStorage.getItem("sendUrl");
  
  return { retentionPeriod, thresholdHigh, thresholdLow, sendHttp, sendUrl };
}

function loadRetentionPeriod() {
  const key = "retentionPeriod";
  const defaultValue = 600;
  const type = 'int';

  return loadNumber(key, defaultValue, type);
}

function loadThresholdLow() {
  const key = "thresholdHigh";
  const defaultValue = 1.0;
  const type = 'float';

  return loadNumber(key, defaultValue, type);
}

function loadThresholdLow() {
  const key = "thresholdLow";
  const defaultValue = 0.8;
  const type = 'float';

  return loadNumber(key, defaultValue, type);
}

function loadNumber(key, defaultValue, type) {
  const str  = settingsStorage.getItem(key);
  
  if (!str || !isJSON(str)) {
    return defaultValue;
  }

  const item = JSON.parse(str);

  if (!item || !item.name) {
    return defaultValue;
  }

  let value

  if (type === 'float') {
    value = parseFloat(item.name);
  } else if (type === 'int') {
    value = parseInt(item.name, 10);
  } else {
    throw new TypeError(`Invalid type: ${type}`);
  }
  
  if (isNaN(value)) {
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

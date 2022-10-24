import { settingsStorage } from 'settings';

console.log(loadSettings());

function loadSettings() {
  const retentionPeriod = loadRetentionPeriod();
  const thresholdHigh = loadThresholdHigh();
  const thresholdLow = loadThresholdLow();
  const sendHttp = loadSendHttp();
  const sendUrl = loadSendUrl();
  
  return { retentionPeriod, thresholdHigh, thresholdLow, sendHttp, sendUrl };
}

function loadRetentionPeriod() {
  const key = 'retentionPeriod';
  const defaultValue = 600;
  const type = 'int';

  return loadNumber(key, defaultValue, type);
}

function loadThresholdHigh() {
  const key = 'thresholdHigh';
  const defaultValue = 1.0;
  const type = 'float';

  return loadNumber(key, defaultValue, type);
}

function loadThresholdLow() {
  const key = 'thresholdLow';
  const defaultValue = 0.8;
  const type = 'float';

  return loadNumber(key, defaultValue, type);
}

function loadSendHttp() {
  const key = 'sendHttp';

  return loadBoolean(key);
}

function loadSendUrl() {
  const key = 'sendUrl';
  const defaultValue = '';

  return loadString(key, defaultValue);
}

function loadString(key, defaultValue) {
  const str  = settingsStorage.getItem(key);
  
  if (!str || !isJSON(str)) {
    return defaultValue;
  }

  const item = JSON.parse(str);

  if (!item || !item.name) {
    return defaultValue;
  }

  return item.name;
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

function loadBoolean(key) {
  const str  = settingsStorage.getItem(key);
  
  if (!str || str !== 'true' || str !== 'false') {
    return false;
  }

  return JSON.parse(str);
}

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (_) {
    return false;
  }
}

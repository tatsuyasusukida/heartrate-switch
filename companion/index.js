import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me as companion } from "companion";

const RESEND_INTERVAL = 5000;

const state = {
  requests: [],
};

setup();

function setup() {
  registerHandlers();
}

function registerHandlers() {
  settingsStorage.addEventListener("change", () => {
    sendSettings();
  });

  if (companion.launchReasons.settingsChanged) {
    sendSettings();
  }

  messaging.peerSocket.addEventListener("open", () => {
    sendSettings();
  });

  messaging.peerSocket.addEventListener("message", onMessage);

  setTimeout(() => {
    setInterval(onTimeout, RESEND_INTERVAL);
  }, RESEND_INTERVAL / 2);
}

async function onMessage(event) {
  if (!event || !event.data) {
    return;
  }

  const { type } = event.data;

  if (type === "request") {
    const url = loadSendUrl();

    if (url) {
      const { request } = event.data;
      // const sent = sendRequest(url, request);

      // if (!sent) {
        request.retry = true;
        state.requests.push(request);
      // }
    }
  } else {
    console.warn(`Unknown event.data.type: ${type}`);
  }
}

function onTimeout() {
  const url = loadSendUrl();

  if (!url) {
    return;
  }

  while (state.requests.length >= 1) {
    const [request] = state.requests;
    const sent = sendRequest(url, request);

    if (!sent) {
      return;
    }

    state.requests.shift();
  }
}

async function sendRequest(url, request) {
  try {
    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (response.status < 200 || 300 <= response.status) {
      console.warn(`Unexpected response.status: ${response.status}`);
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function sendSettings() {
  const type = "settings";
  const settings = loadSettings();
  const data = { type, settings };

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function loadSettings() {
  const retentionPeriod = loadRetentionPeriod();
  const thresholdHigh = loadThresholdHigh();
  const thresholdLow = loadThresholdLow();
  const sendHttp = loadSendHttp();
  const sendUrl = loadSendUrl();

  return { retentionPeriod, thresholdHigh, thresholdLow, sendHttp, sendUrl };
}

function loadRetentionPeriod() {
  const key = "retentionPeriod";
  const defaultValue = 600;
  const type = "int";

  return loadNumber(key, defaultValue, type);
}

function loadThresholdHigh() {
  const key = "thresholdHigh";
  const defaultValue = 1.0;
  const type = "float";

  return loadNumber(key, defaultValue, type);
}

function loadThresholdLow() {
  const key = "thresholdLow";
  const defaultValue = 0.8;
  const type = "float";

  return loadNumber(key, defaultValue, type);
}

function loadSendHttp() {
  const key = "sendHttp";

  return loadBoolean(key);
}

function loadSendUrl() {
  const key = "sendUrl";
  const defaultValue = "";

  return loadString(key, defaultValue);
}

function loadString(key, defaultValue) {
  const str = settingsStorage.getItem(key);

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
  const str = settingsStorage.getItem(key);

  if (!str || !isJSON(str)) {
    return defaultValue;
  }

  const item = JSON.parse(str);

  if (!item || !item.name) {
    return defaultValue;
  }

  let value;

  if (type === "float") {
    value = parseFloat(item.name);
  } else if (type === "int") {
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
  const str = settingsStorage.getItem(key);

  if (!str || !(str === "true" || str === "false")) {
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

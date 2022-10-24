import { me as appbit } from "appbit";
import * as document from "document";
import * as fs from "fs";
import { HeartRateSensor } from "heart-rate";
import * as messaging from "messaging";

appbit.appTimeoutEnabled = false;

const SETTINGS_FILE = "settings.json";
const RESEND_INTERVAL = 5000;

const el = {
  currentRelax: document.getElementById("currentRelax"),
  thresholdHigh: document.getElementById("thresholdHigh"),
  thresholdLow: document.getElementById("thresholdLow"),
  retentionPeriod: document.getElementById("retentionPeriod"),
  sendHttp: document.getElementById("sendHttp"),
  preventDetection: document.getElementById("preventDetection"),
  sendCount: document.getElementById("sendCount"),
};

let state = {
  settings: null,
};

updateSettings(loadSettings());
registerHandlers();

function registerHandlers() {
  if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1 });

    hrm.addEventListener("reading", () => onReading(hrm.heartRate));
    hrm.start();
  }

  messaging.peerSocket.addEventListener("message", event => onMessage(event));

  setInterval(onTimeout, RESEND_INTERVAL);
}

function loadSettings() {
  const defaultSettings = {
    retentionPeriod: 600,
    thresholdHigh: 1.0,
    thresholdLow: 0.8,
    sendHttp: false,
    sendUrl: "",
  };

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return fs.readFileSync(SETTINGS_FILE, "json");
    }
  } catch (err) {
    console.error(`loadSettings error: ${err.message}`);
  }

  return defaultSettings;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, settings, "json");
  } catch (err) {
    console.error(`saveSettings error: ${err.message}`);
  }
}

function updateSettings(settings) {
  state.settings = settings;

  el.thresholdHigh.text = `高しきい値：${settings.thresholdHigh.toFixed(3)}`;
  el.thresholdLow.text = `低しきい値：${settings.thresholdLow.toFixed(3)}`;
  el.retentionPeriod.text = `保持期間：${settings.retentionPeriod}`;
  el.sendHttp.text = `HTTP送信：${settings.sendHttp ? "ON" : "OFF"}`;
}

function onReading(heartRate) {
  if (!heartRate) {
    return;
  }
}

function onMessage(event) {
  if (event && event.data && event.data.type === "settings") {
    const { settings } = event.data;
    updateSettings(settings);
    saveSettings(settings);
  }
}

function onTimeout() {
}

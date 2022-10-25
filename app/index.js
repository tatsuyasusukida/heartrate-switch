import { me as appbit } from "appbit";
import * as document from "document";
import * as fs from "fs";
import { HeartRateSensor } from "heart-rate";
import * as messaging from "messaging";

appbit.appTimeoutEnabled = false;

const SETTINGS_FILE = "settings.json";
const RESEND_INTERVAL = 5000;
const MIN_SAMPLES = 2;

const el = {
  currentRelax: document.getElementById("currentRelax"),
  thresholdHigh: document.getElementById("thresholdHigh"),
  thresholdLow: document.getElementById("thresholdLow"),
  retentionPeriod: document.getElementById("retentionPeriod"),
  sendHttp: document.getElementById("sendHttp"),
  preventDetection: document.getElementById("preventDetection"),
  detectionCount: document.getElementById("detectionCount"),
};

const state = {
  settings: null,
  hrm: null,
  currentRelax: null,
  samples: [],
  requests: [],
  preventDetection: false,
  detectionCount: 0,
};

setup();

function setup() {
  displayPreventDetection();
  displayDetectionCount();
  updateSettings(loadSettings());
  registerHandlers();
}

function registerHandlers() {
  if (HeartRateSensor) {
    state.hrm = new HeartRateSensor({ frequency: 1 });
    state.hrm.addEventListener("reading", onReading);
    state.hrm.start();
  }

  messaging.peerSocket.addEventListener("message", onMessage);
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
  displaySettings();
}

function onReading() {
  const { heartRate } = state.hrm;

  if (!heartRate) {
    return;
  }

  appendSample(heartRate);
  removeSamples();

  if (state.samples.length >= MIN_SAMPLES) {
    calculateRelax();
    detectLowRelax();
    disablePreventDetection();
  }
}

function appendSample(heartRate) {
  const time = new Date().getTime();
  const duration = 60 / heartRate;
  const sample = [time, duration];

  state.samples.push(sample);
}

function removeSamples() {
  const retentionPeriod = state.settings.retentionPeriod * 1000;
  const retentionTime = new Date().getTime() - retentionPeriod;

  while (state.samples.length >= 1) {
    const [sample] = state.samples;
    const [time] = sample;

    if (retentionTime <= time) {
      break;
    }

    state.samples.shift();
  }
}

function calculateRelax() {
  const { samples } = state;
  const n = samples.length;
  const sum = samples.reduce((memo, sample) => {
    const [, duration] = sample;
    return memo + duration;
  }, 0);

  const sampleFirst = samples[0];
  const sampleLast = samples[samples.length - 1];
  const [, durationFirst] = sampleFirst;
  const [, durationLast] = sampleLast;

  const centerX = (sum - durationLast) / (n - 1);
  const centerY = (sum - durationFirst) / (n - 1);
  const relax = Math.sqrt(centerX * centerX + centerY * centerY);

  state.currentRelax = relax;
  displayRelax();
}

function detectLowRelax() {
  if (!state.preventDetection) {
    if (state.currentRelax < state.settings.thresholdLow) {
      state.detectionCount += 1;
      displayDetectionCount();

      if (state.settings.sendHttp) {
        const request = {
          date: new Date().toISOString(),
          relax: state.currentRelax,
          threshold: state.settings.thresholdLow,
          retry: false,
        };

        const sent = sendRequest(request);

        if (!sent) {
          request.retry = true;
          state.requests.push(request);
        }
      }

      state.preventDetection = true;
      displayPreventDetection();
    }
  }
}

function disablePreventDetection() {
  if (state.currentRelax > state.settings.thresholdHigh) {
    state.preventDetection = false;
    displayPreventDetection();
  }
}

function sendRequest(request) {
  if (messaging.peerSocket.readyState !== messaging.peerSocket.OPEN) {
    return false;
  }

  try {
    const type = "request";
    messaging.peerSocket.send({ type, request });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function onMessage(event) {
  if (event && event.data) {
    const { type } = event.data;

    if (type === "settings") {
      const { settings } = event.data;
      updateSettings(settings);
      saveSettings(settings);
    } else {
      console.warn(`Unknown event.data.type: ${type}`);
    }
  }
}

function onTimeout() {
  while (state.requests.length >= 1) {
    const [request] = state.requests;
    const sent = sendRequest(request);

    if (!sent) {
      return;
    }

    state.requests.shift();
  }
}

function displaySettings() {
  const { settings } = state;

  el.thresholdHigh.text = `高しきい値：${settings.thresholdHigh.toFixed(3)}`;
  el.thresholdLow.text = `低しきい値：${settings.thresholdLow.toFixed(3)}`;
  el.retentionPeriod.text = `保持期間：${settings.retentionPeriod}`;
  el.sendHttp.text = `HTTP送信：${settings.sendHttp ? "ON" : "OFF"}`;
}

function displayRelax() {
  el.currentRelax.text = `リラックス傾向：${state.currentRelax.toFixed(3)}`;
}

function displayPreventDetection() {
  el.preventDetection.text = `検出抑制：${
    state.preventDetection ? "ON" : "OFF"
  }`;
}

function displayDetectionCount() {
  el.detectionCount.text = `検出回数：${state.detectionCount}`;
}

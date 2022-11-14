# Heart Rate Switch Fitbit App

https://gallery.fitbit.com/details/989e530e-c44d-448d-8afe-653f4c59a179

## Overview

Heart rate switch is a Fitbit app that evaluates your relaxation tendency from heart rate data and sends HTTP requests when you are in a high stress state. By using this app in combination with IoT services like IFTTT, for example, you can play music on your smart speaker when stress is high.

The app evaluates the relaxation tendency M from N heart rate data samples h_1, h_2, ..., h_n using the following formula: M = sqrt(cx * cs + cy * cy), where with cx = t_1 + t_2 + ... + t_(N-1), cy = t_2 + t_3 + ... + t_N, t_n = 60 / h_n.

Users of this app can set the following 5 items: heart rate data retention period (in seconds), threshold for high relaxation state, threshold for low relaxation state, whether to send HTTP request when low relaxation state is detected, URL for HTTP requests.

This app determines whether the current state is relaxed, normal, or stressed from the relaxation state M, threshold T_H for high relaxation state, and threshold T_L for low relaxation state according to the following criteria: If M >= T_H then Relax, if T_H < M < T_L then Normal, if M <= T_L then Stress.

When the current state changes from normal to stress, the app detects a low-relaxed state and sends an HTTP request. To avoid sending many HTTP requests in a short period of time, the app will suppress further detections after detecting a low-relaxation state once. When the current state changes from normal to relaxed, the app unsuppresses low-relaxation detection.

This app displays the following 7 items on the screen of the device: current relaxation tendency, threshold for high relaxation state, threshold for constant relaxation state, heart rate data retention period, whether to send HTTP request when low relaxation state is detected, the number of times to detect stress states.

This app is open source and the source code is available on GitHub under the MIT license. This app only works on Versa3 and Sense, but feel free to use the source code if you want to use it on other devices.

## Installation

Run the following command in your terminal.

```
git clone https://github.com/tatsuyasusukida/heartrate-switch.git
cd heartrate-switch
npm install
```

## Quick Start

Launch Fitbit OS Simulator and run the following command in your terminal.

```
$ npx fitbit login
$ npx fitbit
fitbit$ bi
```

## License

[MIT](https://github.com/expressjs/express/blob/master/LICENSE)

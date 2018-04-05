const si = require('systeminformation');
require('dotenv').config();
const https = require('https');
const http = require('https');
let deviceName = 'enp1s0';
setInterval(function () {
  si.networkStats(deviceName, function (data) {
    checkServerHealth().then(() => {
      sendRequestToServer(data.rx_sec, true);
    }).catch(() => {
      sendRequestToServer(data.rx_sec, false);
    });
  });
}, 2000);

function sendRequestToServer (bandwidth, serverStatus) {
  let request = https.request({
    host: process.env.API_HOST,
    port: '443',
    path: '/api/jitsi-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => { });
    res.on('end', (data) => { });
  });
  request.on('error', e => {
    console.error(e);
  });
  request.write(JSON.stringify({
    'event_type': 'health-check',
    'current_bandwidth': bandwidth,
    'server_status': serverStatus,
    'server_sid': process.env.SERVER_SID,
  }));
  request.end();
}

function checkServerHealth () {
  return new Promise((reslove, reject) => {
    let request = http.request({
      host: 'localhost',
      port: '8888',
      path: '/about/health',
      method: 'GET'
    }, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => reslove());
      res.on('end', (data) => reslove());
    });
    request.on('error', e => {
      reject(e);
    });
    request.end();
  });
}

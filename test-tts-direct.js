const https = require('https');

const data = JSON.stringify({
  text: 'Halo ini tes koneksi',
  model_id: 'eleven_multilingual_v2'
});

const options = {
  hostname: 'api.elevenlabs.io',
  port: 443,
  path: '/v1/text-to-speech/plgKUYgnlZ1DCNh54DwJ',
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'xi-api-key': 'sk_a6be6f5abc9500359af44ac9add44ca373f47adaaf1092fe',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d.length + ' bytes ');
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();

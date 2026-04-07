const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/tts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('DATA:', data.length > 500 ? data.slice(0, 100) + '... (truncated)' : data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ text: 'Halo dunia ini percobaan suaranya' }));
req.end();

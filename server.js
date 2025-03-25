import http from 'http';
import os from 'os';

const hostname = os.hostname();
const port = 80;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello from ${hostname}\n`);
});

server.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});

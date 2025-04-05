import http from 'http';
import os from 'os';

const hostname = os.hostname();
const port = 80;

function cpuStress() {
  const endTime = Date.now() + 1000;
  while (Date.now() < endTime) {
    Math.sqrt(Math.random());
  }
}

const server = http.createServer((req, res) => {
  cpuStress();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Host name: \n---\n${hostname}\n---`);
});

server.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});

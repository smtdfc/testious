import http, { IncomingMessage, ServerResponse } from 'http';

const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Testious</title>
</head>
<body>

</body>
</html>
`;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Testious Server running at http://localhost:${PORT}`);
});
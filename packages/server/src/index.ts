import http, { IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Server {
  private server: http.Server;
  private folder: string;
  private indexFile: string;
  
  constructor(folder: string) {
    this.folder = folder;
    this.indexFile = path.resolve(__dirname, '../data/client/index.html');
    
    this.server = http.createServer(this.requestHandler.bind(this));
  }
  
  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      if (req.method === 'POST' && req.url === '/api/test/result') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          console.log('Received Test Result:', body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        });
        return;
      }
      
      let filePath: string;
      
      if (req.url === '/') {
        filePath = this.indexFile;
      } else {
        filePath = path.join(this.folder, req.url || '');
      }
      
      const data = await fs.readFile(filePath);
      const contentType = this.getContentType(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('File not found');
    }
  }
  
  private getContentType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.html':
        return 'text/html; charset=utf-8';
      case '.js':
        return 'text/javascript; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.ico':
        return 'image/x-icon';
      default:
        return 'application/octet-stream';
    }
  }
  
  public listen(port: number, callback ? : () => void) {
    this.server.listen(port, callback);
  }
  
  public close(callback ? : () => void) {
    this.server.close(callback);
  }
}
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
      res.writeHead(200);
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('File not found');
    }
  }
  
  public listen(port: number, callback ? : () => void) {
    this.server.listen(port, callback);
  }
  
  public close(callback ? : () => void) {
    this.server.close(callback);
  }
}


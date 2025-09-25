import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type ServerConfig = {
  port: number;
  assetsPath: string;
};

export class Server {
  public app: ReturnType<typeof express>;
  public onTest?: (raw: string) => void;
  constructor(public config: ServerConfig) {
    this.app = express();
    this.app.use(express.json());
    this.app.use('/assets', express.static(config.assetsPath));
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../data/index.html'));
    });

    this.app.post('/submit', (req: Request, res: Response) => {
      this.onTest?.((req.body as any).result);
      res.send('Success');
    });
  }

  listen() {
    this.app.listen(this.config.port, () => {
      console.log(`Testious server listening on port ${this.config.port}`);
    });
  }
}

export function createServer(config: ServerConfig): Server {
  return new Server(config);
}

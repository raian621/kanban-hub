import express, { Request, Response } from 'express';
import helmet from 'helmet'

const app = express();
app.use(helmet());
app.disable('x-powered-by')

app.get('/api', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('Hello World'));
});

export default app;
import express, { Request, Response } from 'express';
const app = express();

app.get('/api', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('Hello World'));
});

export default app;
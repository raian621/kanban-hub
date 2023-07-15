import { readFileSync } from 'fs';
import https from 'https';
import http from 'http';
import { Express } from 'express';

export default function createServer(app:Express, serverProtocol:string):https.Server|http.Server|null {
  let server:https.Server|http.Server|null = null;
  if (serverProtocol === 'https') {
    const key = readFileSync(process.env.SSL_KEY_PATH as string);
    const cert = readFileSync(process.env.SSL_CRT_PATH as string);
    const options = {
      key: key,
      cert: cert
    };
    server = https.createServer(options, app);
  } else if (serverProtocol === 'http') {
    server = http.createServer({}, app);
  }
  return server;
}
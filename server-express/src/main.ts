import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import { CatsRouter } from './routes';

dotenvConfig();

const port = process.env.PORT || 3000;

const server = express().use([CatsRouter('/cats')]);

server.get('/ping', (req, res) => {
  res.contentType('text/plain').send('PONG');
});

server.listen(port, () => console.log(`Started on port :${port}`));

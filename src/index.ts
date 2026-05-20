import 'dotenv/config';
import express from 'express';
import { fundRoutes } from './routes/fundRoutes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.use((request, response, next) => {
  const startedAt = Date.now();

  response.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const query = Object.keys(request.query).length > 0 ? ` query=${JSON.stringify(request.query)}` : '';

    console.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms${query}`);
  });

  next();
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/funds', fundRoutes);

app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(`Unhandled error for ${request.method} ${request.originalUrl}`);
  console.error(error);

  response.status(500).json({
    error: 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
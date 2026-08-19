import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { routes } from './routes/index.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/error.middleware.js';

export const app = express();

// Atrás de proxy (Docker, Nginx) para o rate limit enxergar o IP real.
app.set('trust proxy', 1);

app.use(
  helmet({
    // As imagens são servidas para o frontend em outra origem.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Aguarde um instante.' },
  }),
);

app.use('/api', routes);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

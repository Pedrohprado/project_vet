import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import rawBody from 'fastify-raw-body';
import path from 'path';
import { mainRoutes } from './https/routes/main-route.js';
import { env } from './env/index.js';
import { HttpError } from './services/erros/http-error.js';

export const app = Fastify({});

app.register(cors, {
  origin: env.NODE_ENV === 'production' ? false : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

await app.register(cookie, {
  parseOptions: {
    sameSite: 'lax',
  },
});

app.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },
});

await app.register(fastifyStatic, {
  root: path.resolve('uploads'),
  prefix: '/uploads/',
});

await app.register(websocket);

app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

await app.register(rawBody, {
  field: 'rawBody',
  global: false,
  encoding: false,
  runFirst: true,
});

app.register(mainRoutes, { prefix: '/api' });

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    });
  }

  return reply.status(500).send({
    error: 'Internal server error',
  });
});

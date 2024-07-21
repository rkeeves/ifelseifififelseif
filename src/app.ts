import express, { Response } from 'express';
import bodyParser from 'body-parser';
import { DB } from './model';
import { find, list, upsert, remove, removeAll } from './ifelseifififelseif';

const send = (res: Response, o: { status: number; body: unknown }) => res.status(o.status).json(o.body);

const app = (db: DB) => {
  return express()
    .use(bodyParser.json({ limit: '100mb' }))

    .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

    .get('/:pid/ers', (req, res) => send(res, list(req.params, db)))

    .get('/:pid/ers/:rid', (req, res) => send(res, find(req.params, db)))

    .post('/:pid/ers', (req, res) => send(res, upsert(req.params, req.query, req.body, db)))

    .delete('/:pid/ers/:rid', (req, res) => send(res, remove(req.params, req.query, db)))

    .delete('/:pid/ers', (req, res) => send(res, removeAll(req.params, db)));
};

export default app;

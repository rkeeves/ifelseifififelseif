import { generateMock } from '@anatine/zod-mock';
import { ER } from '../src/model';
import * as Schemas from './schema';
import { z } from 'zod';
import request from 'supertest';

const too_large_int = 999_999_999_999;
const too_small_int = -999_999_999_999;

export type ThePidUsedByTheTest = number;

const _pid = (pid: (_: ThePidUsedByTheTest) => number | string) => ({ pid });
export const Pid = {
  valid: _pid((pid: ThePidUsedByTheTest) => pid),
  too_large: _pid((_: ThePidUsedByTheTest) => too_large_int),
  too_small: _pid((_: ThePidUsedByTheTest) => too_small_int),
  not_a_num: _pid((_: ThePidUsedByTheTest) => 'foo'),
  unknown: _pid((_: ThePidUsedByTheTest) => 123_456_789),
};

export type ExistingRid = number;

const _rid = (rid: (_: ExistingRid[]) => number | string) => ({ rid });
export const Rid = {
  too_large: _rid((_: ExistingRid[]) => too_large_int),
  too_small: _rid((_: ExistingRid[]) => too_small_int),
  not_a_num: _rid((_: ExistingRid[]) => 'foo'),
  unknown: _rid((_: ExistingRid[]) => 123_456_789),
  first: _rid((xs: ExistingRid[]) => xs[0]!),
  last: _rid((xs: ExistingRid[]) => xs[xs.length - 1]!),
};

export const HasNItems = (n: number) => ({ n });

export const Code = (code: number) => ({ code });

export const Schema = {
  isMessage: { schema: Schemas.errorObj },
  isOneEr: { schema: Schemas.er },
  isArrayOfErs: { schema: Schemas.ers },
  isEmpty: { schema: z.object({}).strict() },
  isNewId: { schema: z.number().nonnegative() },
};

const _body = <A>(expectedBody: (_: ER[]) => A) => ({ expectedBody });
export const Body = {
  isBadRequestMsg: _body((_: ER[]) => ({ message: ':(' })),
  isNotFoundMsg: _body((_: ER[]) => ({ message: ':(' })),
  isTheFirst: _body((ers: ER[]) => ers[0]!),
  isTheLast: _body((ers: ER[]) => ers[ers.length - 1]),
  isAll: _body((ers: ER[]) => ers),
  isEmptyArray: _body((_: ER[]) => []),
  skipEq: _body((_: ER[]) => null),
};

export const TC = <A>(title: string, a: A) => ({ title, ...a });

const state = process.env['BASE_URL'] ?? 'http://localhost:3000';

export const api = {
  list: (pid: string | number) => request(state).get(`/${pid}/ers`).set('Accept', 'application/json'),

  find: (pid: string | number, rid: string | number | number) =>
    request(state).get(`/${pid}/ers/${rid}`).set('Accept', 'application/json'),

  upsert: (pid: string | number, payload: object, query: { o?: boolean | string }) =>
    query.o === undefined
      ? request(state).post(`/${pid}/ers`).set('Accept', 'application/json').send(payload)
      : request(state).post(`/${pid}/ers?o=${query.o}`).set('Accept', 'application/json').send(payload),

  remove: (pid: string | number, rid: string | number, query: { ra?: boolean | string }) =>
    query.ra === undefined
      ? request(state).delete(`/${pid}/ers/${rid}`).set('Accept', 'application/json')
      : request(state).delete(`/${pid}/ers/${rid}?ra=${query.ra}`).set('Accept', 'application/json'),
  clean: (pid: number) => request(state).delete(`/${pid}/ers`).set('Accept', 'application/json'),
};

export type Api = typeof api;

export const setup = async (thePid: ThePidUsedByTheTest, o: { n: number }) => {
  await api.clean(thePid);
  const ers: ER[] = [];
  for (let i = 0; i < o.n; i++) {
    const er = generateMock(Schemas.er);
    er.rid = -1;
    const body = await api.upsert(thePid, er, {}).then(r => r.body);
    er.rid = z.number().positive().describe('The upsert must return the next int in sequence').parse(body);
    ers.push(er);
  }
  return { ers: ers, api };
};

export const generateEr = () => generateMock(Schemas.er);

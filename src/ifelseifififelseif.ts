import { StatusCodes } from 'http-status-codes';
import { DB } from './model';

export type Err = { status: StatusCodes; body: { message: string } };

export type Resp<A> = Err | { status: StatusCodes; body: A };

const notFound = (message: string) => ({ status: StatusCodes.NOT_FOUND, body: { message } });

const badRequest = (message: string) => ({ status: StatusCodes.BAD_REQUEST, body: { message } });

const deleted = () => ({ status: StatusCodes.ACCEPTED, body: { message: 'Deleted' } });

const ok = <A>(body: A): Resp<A> => ({ status: StatusCodes.OK, body });

const created = <A>(body: A): Resp<A> => ({ status: StatusCodes.CREATED, body });

const parseNat = (s: string) => {
  const x = parseInt(s);
  return isNaN(x) || x < 0 || 2147483647 < x ? NaN : x;
};

const parseNatOrNegOne = (s: string) => {
  const x = parseInt(s);
  return isNaN(x) || x < -1 || 2147483647 < x ? NaN : x;
};

export const list = (params: { pid: string }, db: DB) => {
  const pid = parseNat(params.pid);
  if (isNaN(pid)) return badRequest(':(');
  const ers = db.docs.find(x => pid === x.pid);
  if (ers === undefined) return ok([]);
  return ok(ers.ers);
};

export const find = (params: { pid: string; rid: string }, db: DB) => {
  const pid = parseNat(params.pid);
  if (isNaN(pid)) return badRequest(':(');
  const rid = parseNat(params.rid);
  if (isNaN(rid)) return badRequest(':(');
  const ers = db.docs.find(x => pid === x.pid);
  if (ers === undefined) return notFound(':(');
  const er = ers.ers.find(x => rid === x.rid);
  if (er === undefined) return notFound(':(');
  return ok(er);
};

export const upsert = (params: { pid: string }, _query: { o?: boolean }, body: any, db: DB) => {
  const pid = parseNat(params.pid);
  if (isNaN(pid)) return badRequest(':(');
  if ('object' !== typeof body) return badRequest(':(');
  if (body['rid'] === undefined) return badRequest(':(');
  const rid = parseNatOrNegOne(body['rid']);
  if (isNaN(rid)) return badRequest(':(');
  if (rid < -1) {
    return notFound(':(');
  } else if (rid === 0) {
    return notFound(':(');
  } else if (rid === -1) {
    let fst = db.docs.find(x => pid === x.pid);
    if (fst === undefined) {
      fst = { pid, ers: [] };
      db.docs.push(fst);
    }
    const newEr = { ...body, rid: ++db.seq };
    fst.ers.push(newEr);
    return created(newEr.rid);
  } else {
    let fst = db.docs.find(x => pid === x.pid);
    if (fst === undefined) {
      return notFound(':(');
    }
    const er = fst.ers.findIndex(x => rid === x.rid);
    if (er < 0) {
      return notFound(':(');
    } else {
      fst.ers[er] = { ...fst.ers[er], ...body };
      return ok(fst.ers[er]?.rid);
    }
  }
};

export const remove = (params: { pid: string; rid: string }, query: { ra?: boolean }, db: DB) => {
  const pid = parseNat(params.pid);
  if (isNaN(pid)) return badRequest(':(');
  const rid = parseNat(params.rid);
  if (isNaN(rid)) return badRequest(':(');
  if (query.ra === undefined || query.ra === false) {
    const ers = db.docs.find(er => er.pid === pid);
    if (ers === undefined) return notFound(':(');
    const pos = ers.ers.findIndex(er => er.rid === rid);
    if (pos < 0) return notFound(':(');
    ers.ers.splice(pos, 1);
    return deleted();
  } else {
    const ers = db.docs.find(x => pid === x.pid);
    if (ers === undefined) return notFound(':(');
    ers.ers = [];
    return deleted();
  }
};

export const removeAll = (params: { pid: string }, db: DB) => {
  const pid = parseInt(params.pid);
  if (isNaN(pid)) return badRequest(':(');
  const id = db.docs.findIndex(x => pid === x.pid);
  if (id < 0) return notFound(':(');
  db.docs.splice(id, 1);
  return deleted();
};

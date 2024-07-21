import { describe, expect, test } from '@jest/globals';
import { TC, HasNItems, Pid, Code, Body, Schema, setup, generateEr, Rid } from './fixtures';

describe('Upsert', () => {
  const PID = 4_999_999;

  describe('Insert', () => {
    // prettier-ignore
    const SUNNY = [
      TC('inserts into empty @smoke',      { n: 0 }),
      TC('inserts into non-empty @smoke',  { n: 2 }),
    ];

    SUNNY.forEach(({ title, n }) => {
      test(`201 - ${title}`, async () => {
        const { ers, api } = await setup(PID, { n });
        const sent = { ...generateEr(), rid: -1 };
        const res = await api.upsert(PID, sent, {}).expect(201);
        const newRid = Schema.isNewId.schema.parse(res.body);
        expect(newRid).toBeGreaterThan(ers.reduce((x, y) => Math.max(x, y.rid), -1));
        const postInsert = await api.list(PID).expect(200);
        expect(postInsert.body).toEqual([...ers, { ...sent, rid: newRid }]);
      });
    });

    // prettier-ignore
    const RAINY = [
      TC(':pid too large',
        { ...HasNItems(0), ...Pid.too_large, ...Code(400) }),
      TC(':pid too small',
        { ...HasNItems(0), ...Pid.too_small, ...Code(400) }),
      TC(':pid not a num',
        { ...HasNItems(0), ...Pid.not_a_num, ...Code(400) }),
    ];

    RAINY.forEach(({ title, n, pid, code }) => {
      test(`${code} - ${title}`, async () => {
        const { api } = await setup(PID, { n });
        const res = await api.upsert(pid(PID), { ...generateEr(), rid: -1 }, {}).expect(code);
        const parsed = Schema.isMessage.schema.parse(res.body);
        expect(parsed).toEqual({ message: ':(' });
      });
    });
  });

  describe('Update', () => {
    // prettier-ignore
    const SUNNY = [
      TC('update the first @smoke' ,  { n: 2, i: 0 }),
      TC('update the second @smoke',  { n: 2, i: 1 }),
    ];

    SUNNY.forEach(({ title, n, i }) => {
      test(`200 - ${title}`, async () => {
        const { ers, api } = await setup(PID, { n });
        const sent = { ...generateEr(), rid: ers[i]!.rid };
        const res = await api.upsert(PID, sent, {}).expect(200);
        expect(res.body).toEqual(sent.rid);
        const postUpdate = await api.list(PID).expect(200);
        expect(postUpdate.body).toEqual(ers.map(er => (er.rid === sent.rid ? sent : er)));
      });
    });

    // prettier-ignore
    const RAINY = [
      TC(':pid too large',
        { ...HasNItems(0), ...Pid.too_large, ...Rid.unknown  , ...Code(400), ...Body.isBadRequestMsg }),
      TC(':pid too small',
        { ...HasNItems(0), ...Pid.too_small, ...Rid.unknown  , ...Code(400), ...Body.isBadRequestMsg }),
      TC(':pid not a num',
        { ...HasNItems(0), ...Pid.not_a_num, ...Rid.unknown  , ...Code(400), ...Body.isBadRequestMsg }),
      TC(':pid unknown',
        { ...HasNItems(0), ...Pid.unknown  , ...Rid.unknown  , ...Code(404), ...Body.isNotFoundMsg }),
      TC(':rid too large',
        { ...HasNItems(0), ...Pid.valid    , ...Rid.too_large, ...Code(400), ...Body.isBadRequestMsg }),
      TC(':rid too small',
        { ...HasNItems(0), ...Pid.valid    , ...Rid.too_small, ...Code(400), ...Body.isBadRequestMsg }),
      TC(':rid not a num',
        { ...HasNItems(0), ...Pid.valid    , ...Rid.not_a_num, ...Code(400), ...Body.isBadRequestMsg }),
      TC('cant find in empty array @smoke',
        { ...HasNItems(0), ...Pid.valid    , ...Rid.unknown  , ...Code(404), ...Body.isNotFoundMsg }),
      TC('cant find by :rid @smoke',
        { ...HasNItems(2), ...Pid.valid    , ...Rid.unknown  , ...Code(404), ...Body.isNotFoundMsg })
    ];

    RAINY.forEach(({ title, n, pid, rid, code, expectedBody }) => {
      test(`${code} - ${title}`, async () => {
        const { ers, api } = await setup(PID, { n });
        const sent = { ...generateEr(), rid: rid(ers.map(er => er.rid)) };
        const res = await api.upsert(pid(PID), sent, {}).expect(code);
        const parsed = Schema.isMessage.schema.parse(res.body);
        const expected = expectedBody(ers);
        expect(parsed).toEqual(expected);
      });
    });
  });
});

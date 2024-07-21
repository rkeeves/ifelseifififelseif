import { describe, test, expect } from '@jest/globals';
import { TC, HasNItems, Pid, Rid, Code, Body, Schema, setup } from './fixtures';

describe('Remove', () => {
  const PID = 3_999_999;
  // prettier-ignore
  const SUNNY = [
    TC('deletes first @smoke', { n: 2, i: 0 }),
    TC('deletes last @smoke', { n: 2, i: 1 }),
  ];

  SUNNY.forEach(({ title, n, i }) => {
    test(`200 - ${title}`, async () => {
      const { ers, api } = await setup(PID, { n });
      const idToDelete = ers[i]!.rid;
      const resDeleteFirst = await api.remove(PID, idToDelete, {}).expect(202);
      expect(resDeleteFirst.body).toEqual({ message: 'Deleted' });
      await api.remove(PID, idToDelete, {}).expect(404);
      const resList = await api.list(PID).expect(200);
      expect(resList.body).toEqual(ers.filter(er => er.rid !== idToDelete));
    });
  });

  // prettier-ignore
  const RAINY = [
    TC(':pid too large',
      { ...HasNItems(0), ...Pid.too_large, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid too small',
      { ...HasNItems(0), ...Pid.too_small, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid not a num',
      { ...HasNItems(0), ...Pid.not_a_num, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid unknown' ,
      { ...HasNItems(0), ...Pid.unknown  , ...Rid.unknown  , ...Code(404), ...Schema.isMessage, ...Body.isNotFoundMsg }),
    TC(':rid too large',
      { ...HasNItems(0), ...Pid.valid    , ...Rid.too_large, ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':rid too small',
      { ...HasNItems(0), ...Pid.valid    , ...Rid.too_small, ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':rid not a num',
      { ...HasNItems(0), ...Pid.valid    , ...Rid.not_a_num, ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC('cant find in empty array @smoke',
      { ...HasNItems(0), ...Pid.valid    , ...Rid.unknown  , ...Code(404), ...Schema.isMessage, ...Body.isNotFoundMsg }),
    TC('cant find by :rid @smoke',
      { ...HasNItems(2), ...Pid.valid    , ...Rid.unknown  , ...Code(404), ...Schema.isMessage, ...Body.isNotFoundMsg })
  ];

  RAINY.forEach(({ title, n, pid, rid, code, schema, expectedBody }) => {
    test(`${code} - ${title}`, async () => {
      const { ers, api } = await setup(PID, { n });
      const res = await api.remove(pid(PID), rid(ers.map(er => er.rid)), {}).expect(code);
      const parsed = schema.parse(res.body);
      expect(parsed).toEqual(expectedBody(ers));
    });
  });
});

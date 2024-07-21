import { describe, expect, test } from '@jest/globals';
import { TC, HasNItems, Pid, Rid, Code, Body, Schema, setup } from './fixtures';

describe('Find', () => {
  const PID = 1_999_999;

  // prettier-ignore
  const SUNNY = [
    TC('finds first @smoke',
      { ...HasNItems(2), ...Pid.valid    , ...Rid.first    , ...Code(200), ...Schema.isOneEr   , ...Body.isTheFirst }),
    TC('finds last @smoke',
      { ...HasNItems(2), ...Pid.valid    , ...Rid.last     , ...Code(200), ...Schema.isOneEr   , ...Body.isTheLast }),
  ];

  // prettier-ignore
  const RAINY = [
    TC(':pid too large',
      { ...HasNItems(0), ...Pid.too_large, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid too small',
      { ...HasNItems(0), ...Pid.too_small, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid not a num',
      { ...HasNItems(0), ...Pid.not_a_num, ...Rid.unknown  , ...Code(400), ...Schema.isMessage, ...Body.isBadRequestMsg }),
    TC(':pid unknown',
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
      { ...HasNItems(2), ...Pid.valid    , ...Rid.unknown  , ...Code(404), ...Schema.isMessage, ...Body.isNotFoundMsg }),
  ];

  [...SUNNY, ...RAINY].forEach(({ title, n, pid, rid, code, schema, expectedBody }) => {
    test(`${code} - ${title}`, async () => {
      const { ers, api } = await setup(PID, { n });
      const res = await api.find(pid(PID), rid(ers.map(er => er.rid))).expect(code);
      const parsed = schema.parse(res.body);
      expect(parsed).toEqual(expectedBody(ers));
    });
  });
});

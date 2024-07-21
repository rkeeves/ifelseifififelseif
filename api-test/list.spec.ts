import { describe, expect, test } from '@jest/globals';
import { TC, HasNItems, Pid, Code, Body, Schema, setup } from './fixtures';

describe('List', () => {
  const PID = 2_999_999;

  // prettier-ignore
  const SUNNY = [
    TC(':pid unknown @smoke',
      { ...HasNItems(0), ...Pid.unknown  , ...Code(200), ...Schema.isArrayOfErs, ...Body.isEmptyArray }),
    TC('empty array @smoke',
      { ...HasNItems(0), ...Pid.valid    , ...Code(200), ...Schema.isArrayOfErs, ...Body.isEmptyArray }),
    TC('finds all @smoke',
      { ...HasNItems(2), ...Pid.valid    , ...Code(200), ...Schema.isArrayOfErs, ...Body.isAll }),
  ];

  // prettier-ignore
  const RAINY = [
    TC(':pid too large',
      { ...HasNItems(0), ...Pid.too_large, ...Code(400), ...Schema.isMessage  , ...Body.isBadRequestMsg }),
    TC(':pid too small',
      { ...HasNItems(0), ...Pid.too_small, ...Code(400), ...Schema.isMessage  , ...Body.isBadRequestMsg }),
    TC(':pid not a num',
      { ...HasNItems(0), ...Pid.not_a_num, ...Code(400), ...Schema.isMessage  , ...Body.isBadRequestMsg })
  ];

  [...SUNNY, ...RAINY].forEach(({ title, n, pid, code, schema, expectedBody }) => {
    test(`${code} - ${title}`, async () => {
      const { ers, api } = await setup(PID, { n });
      const res = await api.list(pid(PID)).expect(code);
      const parsed = schema.parse(res.body);
      expect(parsed).toEqual(expectedBody(ers));
    });
  });
});

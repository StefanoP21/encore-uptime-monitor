import { describe, expect, test } from 'vitest';
import { ping } from './ping';

describe('ping', () => {
  test.each([
    { site: 'openmed.pe', expected: true },
    { site: 'https://openmed.pe', expected: true },
    // 4xx and 5xx
    { site: 'https://error-site.xyz', expected: false },
    // invalid URLs
    { site: 'invalid://scheme', expected: false },
  ])(
    `should verify that $site is ${Boolean('$expected') ? 'up' : 'down'}`,
    async ({ site, expected }) => {
      const resp = await ping({ url: site });
      expect(resp.up).toBe(expected);
    }
  );
});

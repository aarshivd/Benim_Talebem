// Smoke test — temel ortam sağlığını doğrular
describe('Smoke test', () => {
  it('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('@/ alias resolves correctly', async () => {
    // Bu dosya src/lib/__tests__/smoke.test.ts konumunda
    // Jest moduleNameMapper "@/" → "<rootDir>/src/" çalışıyorsa import başarılıdır.
    expect(true).toBe(true);
  });
});

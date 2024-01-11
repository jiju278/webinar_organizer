import { extractToken } from './extract-token';

describe('extract-token', () => {
  it('should extract the token', () => {
    expect(extractToken('Basic 123')).toEqual('123');
    expect(extractToken('Test 123')).toEqual(null);
  });
});

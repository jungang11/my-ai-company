import { describe, expect, it } from 'vitest';
import { RingBuffer } from './ring-buffer.js';

describe('RingBuffer', () => {
  it('maxBytes 이하에선 모든 데이터 유지', () => {
    const rb = new RingBuffer(100);
    rb.write('hello');
    rb.write(' ');
    rb.write('world');
    expect(rb.snapshot()).toBe('hello world');
    expect(rb.bytes()).toBe(11);
  });

  it('maxBytes 초과 시 오래된 chunk부터 축출', () => {
    const rb = new RingBuffer(10);
    rb.write('aaaa');
    rb.write('bbbb');
    rb.write('cccc');
    expect(rb.snapshot()).toBe('bbbbcccc');
    expect(rb.bytes()).toBe(8);
  });

  it('단일 chunk가 maxBytes 초과면 그것만 유지', () => {
    const rb = new RingBuffer(5);
    rb.write('aaa');
    rb.write('bbbbbbbbbb');
    expect(rb.snapshot()).toBe('bbbbbbbbbb');
  });

  it('clear()', () => {
    const rb = new RingBuffer(100);
    rb.write('abc');
    rb.clear();
    expect(rb.snapshot()).toBe('');
    expect(rb.bytes()).toBe(0);
  });

  it('빈 문자열 write는 무시', () => {
    const rb = new RingBuffer(10);
    rb.write('');
    expect(rb.snapshot()).toBe('');
    expect(rb.bytes()).toBe(0);
  });
});

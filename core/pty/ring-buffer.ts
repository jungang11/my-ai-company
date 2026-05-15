export class RingBuffer {
  private chunks: string[] = [];
  private byteSize = 0;

  constructor(private readonly maxBytes: number) {
    if (maxBytes <= 0) throw new Error('maxBytes must be > 0');
  }

  write(data: string): void {
    if (!data) return;
    this.chunks.push(data);
    this.byteSize += Buffer.byteLength(data, 'utf-8');
    while (this.byteSize > this.maxBytes && this.chunks.length > 1) {
      const removed = this.chunks.shift()!;
      this.byteSize -= Buffer.byteLength(removed, 'utf-8');
    }
  }

  snapshot(): string {
    return this.chunks.join('');
  }

  bytes(): number {
    return this.byteSize;
  }

  clear(): void {
    this.chunks = [];
    this.byteSize = 0;
  }
}

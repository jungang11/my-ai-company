import { describe, expect, it } from 'vitest';
import { parseBoard } from './parser.js';

describe('parseBoard', () => {
  it('컬럼/카드/체크박스/담당자/설명 파싱', () => {
    const md = `# Board

## TODO

- [ ] @dev-1 첫 번째 일거리
  > 상세 설명 한 줄

## IN PROGRESS

## DONE

- [x] @dev-1 출근하기
`;
    const board = parseBoard(md);

    expect(board.columns).toHaveLength(3);
    expect(board.columns.map((c) => c.name)).toEqual(['TODO', 'IN PROGRESS', 'DONE']);

    const [todo, inProg, done] = board.columns;

    expect(todo.cards).toHaveLength(1);
    expect(todo.cards[0]).toMatchObject({
      id: 'TODO-0',
      done: false,
      assignee: 'dev-1',
      title: '첫 번째 일거리',
      description: '상세 설명 한 줄',
    });

    expect(inProg.cards).toEqual([]);

    expect(done.cards).toHaveLength(1);
    expect(done.cards[0]).toMatchObject({
      id: 'DONE-0',
      done: true,
      assignee: 'dev-1',
      title: '출근하기',
    });
  });

  it('담당자 없는 카드도 파싱', () => {
    const md = `## TODO

- [ ] 누가 할지 미정인 일`;
    const board = parseBoard(md);
    expect(board.columns[0].cards[0]).toMatchObject({
      done: false,
      title: '누가 할지 미정인 일',
    });
    expect(board.columns[0].cards[0].assignee).toBeUndefined();
  });

  it('여러 줄 description은 newline으로 join', () => {
    const md = `## TODO

- [ ] @dev-1 일거리
  > 첫째 줄
  > 둘째 줄`;
    const board = parseBoard(md);
    expect(board.columns[0].cards[0].description).toBe('첫째 줄\n둘째 줄');
  });

  it('헤딩 없는 콘텐츠는 무시', () => {
    const md = `# Title

free text

- [ ] @dev-1 이 카드는 컬럼 없으니 무시되어야 함

## TODO

- [ ] @dev-1 진짜 카드`;
    const board = parseBoard(md);
    expect(board.columns).toHaveLength(1);
    expect(board.columns[0].cards).toHaveLength(1);
    expect(board.columns[0].cards[0].title).toBe('진짜 카드');
  });
});

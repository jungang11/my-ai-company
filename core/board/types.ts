export type Card = {
  id: string;
  done: boolean;
  assignee?: string;
  title: string;
  description?: string;
};

export type Column = {
  name: string;
  cards: Card[];
};

export type Board = {
  columns: Column[];
};

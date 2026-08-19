export type ProductIdeaStatus = 'IDEA' | 'TODO' | 'DOING' | 'DONE';

export type ProductIdeaAuthor = {
  id: string;
  name: string;
};

export type ProductIdea = {
  id: string;
  title: string;
  description: string | null;
  status: ProductIdeaStatus;
  position: number;
  authorId: string;
  author: ProductIdeaAuthor;
  createdAt: string;
  updatedAt: string;
};

export type ProductIdeaListResponse = {
  items: ProductIdea[];
};

export type CreateProductIdeaPayload = {
  title: string;
  description?: string | null;
};

export type MoveProductIdeaPayload = {
  status: ProductIdeaStatus;
  index: number;
};

export const PRODUCT_IDEA_COLUMNS: {
  status: ProductIdeaStatus;
  title: string;
  hint: string;
}[] = [
  { status: 'IDEA', title: 'Ideias', hint: 'Sugestões da comunidade' },
  { status: 'TODO', title: 'A fazer', hint: 'Na fila para começar' },
  { status: 'DOING', title: 'Em andamento', hint: 'Estamos construindo' },
  { status: 'DONE', title: 'Concluído', hint: 'Já está no produto' },
];

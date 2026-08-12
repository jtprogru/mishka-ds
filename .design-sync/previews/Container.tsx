import { Container, PostCard } from '@jtprogru/mishka-ds';

export const Wide = () => (
  <Container>
    <PostCard title="Широкая колонка — 1200px" href="#" date="сетка карточек и списков" />
  </Container>
);

export const Narrow = () => (
  <Container width="narrow">
    <PostCard title="Узкая колонка — 720px" href="#" date="длинный текст, статья, резюме" />
  </Container>
);

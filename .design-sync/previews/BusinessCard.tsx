import { BusinessCard } from '@jtprogru/mishka-ds';

export const Front = () => (
  <BusinessCard guides name="Михаил Савин" role="SRE · «Мишка на сервере»" />
);

export const Back = () => (
  <BusinessCard
    guides
    side="back"
    contacts={['jtprog.ru', 'savinmi.ru', 't.me/jtprogru', 'jtprogru@gmail.com']}
  />
);

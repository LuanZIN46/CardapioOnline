import type { AddonGroup } from '@/types';

export const addonGroups: AddonGroup[] = [
  {
    id: 'grp-burger-extras',
    name: 'Turbine seu lanche',
    description: 'Escolha até 6 adicionais',
    minSelection: 0,
    maxSelection: 6,
    allowRepeat: true,
    options: [
      { id: 'add-bacon', name: 'Bacon crocante', price: 500, available: true },
      { id: 'add-cheddar', name: 'Cheddar cremoso', price: 400, available: true },
      { id: 'add-queijo', name: 'Queijo mussarela', price: 300, available: true },
      { id: 'add-burger', name: 'Hambúrguer extra 150g', price: 900, available: true },
      { id: 'add-ovo', name: 'Ovo frito', price: 250, available: true },
      { id: 'add-cebola-caramelizada', name: 'Cebola caramelizada', price: 350, available: true },
      { id: 'add-picles', name: 'Picles', price: 200, available: true },
    ],
  },
  {
    id: 'grp-porcao-extras',
    name: 'Acompanhamentos da porção',
    description: 'Escolha até 4 adicionais',
    minSelection: 0,
    maxSelection: 4,
    allowRepeat: true,
    options: [
      { id: 'add-porcao-cheddar', name: 'Cheddar por cima', price: 600, available: true },
      { id: 'add-porcao-bacon', name: 'Bacon em cubos', price: 700, available: true },
      { id: 'add-porcao-catupiry', name: 'Catupiry', price: 600, available: true },
      { id: 'add-porcao-vinagrete', name: 'Vinagrete', price: 400, available: true },
    ],
  },
  {
    id: 'grp-gelo-limao',
    name: 'Preferências',
    description: 'Opcional',
    minSelection: 0,
    maxSelection: 2,
    allowRepeat: false,
    options: [
      { id: 'add-gelo-extra', name: 'Gelo extra', price: 0, available: true },
      { id: 'add-limao', name: 'Rodela de limão', price: 100, available: true },
    ],
  },
];

export const addonGroupsById = new Map(addonGroups.map((group) => [group.id, group]));

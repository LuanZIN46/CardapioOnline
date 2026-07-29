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
    id: 'grp-molhos',
    name: 'Molhos',
    description: 'Escolha até 3 molhos',
    minSelection: 0,
    maxSelection: 3,
    allowRepeat: true,
    options: [
      { id: 'add-molho-barbecue', name: 'Barbecue', price: 200, available: true },
      { id: 'add-molho-alho', name: 'Maionese de alho', price: 200, available: true },
      { id: 'add-molho-cheddar', name: 'Molho cheddar', price: 250, available: true },
      { id: 'add-molho-pardal', name: 'Molho do Pardal (picante)', price: 250, available: true },
    ],
  },
  {
    id: 'grp-ponto-carne',
    name: 'Ponto da carne',
    description: 'Escolha 1 opção',
    minSelection: 1,
    maxSelection: 1,
    allowRepeat: false,
    options: [
      { id: 'add-ponto-mal', name: 'Mal passado', price: 0, available: true },
      { id: 'add-ponto-ao-ponto', name: 'Ao ponto', price: 0, available: true },
      { id: 'add-ponto-bem', name: 'Bem passado', price: 0, available: true },
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
    id: 'grp-hotdog-extras',
    name: 'Adicionais do dog',
    description: 'Escolha até 5 adicionais',
    minSelection: 0,
    maxSelection: 5,
    allowRepeat: true,
    options: [
      { id: 'add-dog-salsicha', name: 'Salsicha extra', price: 400, available: true },
      { id: 'add-dog-batata', name: 'Batata palha extra', price: 200, available: true },
      { id: 'add-dog-milho', name: 'Milho', price: 200, available: true },
      { id: 'add-dog-ervilha', name: 'Ervilha', price: 200, available: true },
      { id: 'add-dog-cheddar', name: 'Cheddar', price: 400, available: true },
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

/**
 * Cardápio real do Bar do Pardal, transcrito dos encartes de hambúrgueres,
 * porções e bebidas. Fonte única para o seed — o frontend não guarda mais
 * nenhum produto, ele lê tudo pela API.
 *
 * Preços em centavos.
 */

export interface CategoriaSeed {
  slug: string;
  nome: string;
  /** Emoji exibido na navegação do cardápio. */
  icone: string;
  ordem: number;
}

export interface ProdutoSeed {
  slug: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
  ingredientes?: string[];
  /** "novo" | "promocao" | "mais-vendido" */
  badges?: string[];
  ordem: number;
  /** Grupos de adicionais oferecidos na montagem. */
  grupos?: string[];
}

export interface GrupoAdicionalSeed {
  slug: string;
  nome: string;
  descricao: string;
  minSelecao: number;
  maxSelecao: number;
  permiteRepetir: boolean;
  ordem: number;
  opcoes: Array<{ nome: string; preco: number }>;
}

const foto = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const categoriasSeed: CategoriaSeed[] = [
  { slug: 'lanches', nome: 'Lanches', icone: '🍔', ordem: 1 },
  { slug: 'porcoes', nome: 'Porções', icone: '🍟', ordem: 2 },
  { slug: 'bebidas', nome: 'Bebidas', icone: '🥤', ordem: 3 },
];

export const gruposAdicionaisSeed: GrupoAdicionalSeed[] = [
  {
    slug: 'turbine-lanche',
    nome: 'Turbine seu lanche',
    descricao: 'Escolha até 6 adicionais',
    minSelecao: 0,
    maxSelecao: 6,
    permiteRepetir: true,
    ordem: 1,
    opcoes: [
      { nome: 'Bacon crocante', preco: 500 },
      { nome: 'Cheddar cremoso', preco: 400 },
      { nome: 'Queijo mussarela', preco: 300 },
      { nome: 'Hambúrguer extra 150g', preco: 900 },
      { nome: 'Ovo frito', preco: 250 },
      { nome: 'Cebola caramelizada', preco: 350 },
      { nome: 'Picles', preco: 200 },
    ],
  },
  {
    slug: 'acompanhamentos-porcao',
    nome: 'Acompanhamentos da porção',
    descricao: 'Escolha até 4 adicionais',
    minSelecao: 0,
    maxSelecao: 4,
    permiteRepetir: true,
    ordem: 2,
    opcoes: [
      { nome: 'Cheddar por cima', preco: 600 },
      { nome: 'Bacon em cubos', preco: 700 },
      { nome: 'Catupiry', preco: 600 },
      { nome: 'Vinagrete', preco: 400 },
    ],
  },
];

const ACOMPANHA = 'Acompanha batata frita.';

export const produtosSeed: ProdutoSeed[] = [
  /* --------------------------------------------------------- Lanches */
  {
    slug: 'classico-do-pardal',
    nome: 'Clássico do Pardal',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), queijo cheddar, alface americana, tomate, cebola roxa e maionese da casa. ${ACOMPANHA}`,
    preco: 2400,
    categoria: 'lanches',
    imagem: foto('photo-1568901346375-23c9450c58cd'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Queijo cheddar', 'Alface americana', 'Tomate', 'Cebola roxa', 'Maionese da casa', 'Batata frita'],
    badges: ['promocao', 'mais-vendido'],
    ordem: 1,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'fim-de-expediente',
    nome: 'Fim de Expediente',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), queijo cheddar, bacon, cebola roxa e maionese da casa. ${ACOMPANHA}`,
    preco: 2900,
    categoria: 'lanches',
    imagem: foto('photo-1594212699903-ec8a3eca50f5'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Queijo cheddar', 'Bacon', 'Cebola roxa', 'Maionese da casa', 'Batata frita'],
    ordem: 2,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'asa-dourada',
    nome: 'Asa Dourada',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), cheddar em dobro, cebola roxa e maionese da casa. ${ACOMPANHA}`,
    preco: 2900,
    categoria: 'lanches',
    imagem: foto('photo-1550547660-d9450f859349'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Cheddar em dobro', 'Cebola roxa', 'Maionese da casa', 'Batata frita'],
    ordem: 3,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'pe-de-mesa',
    nome: 'Pé de Mesa',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), queijo cheddar, bacon, alface americana, tomate, cebola roxa e maionese da casa. ${ACOMPANHA}`,
    preco: 3000,
    categoria: 'lanches',
    imagem: foto('photo-1606755962773-d324e0a13086'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Queijo cheddar', 'Bacon', 'Alface americana', 'Tomate', 'Cebola roxa', 'Maionese da casa', 'Batata frita'],
    ordem: 4,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'catupiry',
    nome: 'Catupiry',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), queijo muçarela, catupiry, alface americana, tomate e maionese da casa. ${ACOMPANHA}`,
    preco: 2900,
    categoria: 'lanches',
    imagem: foto('photo-1520072959219-c595dc870360'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Queijo muçarela', 'Catupiry', 'Alface americana', 'Tomate', 'Maionese da casa', 'Batata frita'],
    ordem: 5,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'copo-cheio',
    nome: 'Copo Cheio',
    descricao: `Pão brioche, 2 hambúrgueres de costela (150g), queijo cheddar, bacon, cebola roxa e maionese da casa. ${ACOMPANHA}`,
    preco: 3500,
    categoria: 'lanches',
    imagem: foto('photo-1594212699903-ec8a3eca50f5'),
    ingredientes: ['Pão brioche', '2 hambúrgueres de costela 150g', 'Queijo cheddar', 'Bacon', 'Cebola roxa', 'Maionese da casa', 'Batata frita'],
    ordem: 6,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'pardoritos',
    nome: 'Pardoritos',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), queijo cheddar, doritos e molho barbecue. ${ACOMPANHA}`,
    preco: 3200,
    categoria: 'lanches',
    imagem: foto('photo-1550547660-d9450f859349'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Queijo cheddar', 'Doritos', 'Molho barbecue', 'Batata frita'],
    ordem: 7,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'empanado-do-pardal',
    nome: 'Empanado do Pardal',
    descricao: `Pão brioche, hambúrguer artesanal de costela (150g), catupiry empanado, muçarela, alface e tomate. ${ACOMPANHA}`,
    preco: 3800,
    categoria: 'lanches',
    imagem: foto('photo-1606755962773-d324e0a13086'),
    ingredientes: ['Pão brioche', 'Hambúrguer de costela 150g', 'Catupiry empanado', 'Muçarela', 'Alface', 'Tomate', 'Batata frita'],
    ordem: 8,
    grupos: ['turbine-lanche'],
  },
  {
    slug: 'ignorante',
    nome: 'Ignorante',
    descricao: `Pão brioche, 2 hambúrgueres artesanais de costela (150g cada), ovo, bacon, muçarela, cheddar, alface, tomate e cebola. ${ACOMPANHA}`,
    preco: 4300,
    categoria: 'lanches',
    imagem: foto('photo-1568901346375-23c9450c58cd'),
    ingredientes: ['Pão brioche', '2 hambúrgueres de costela 150g', 'Ovo', 'Bacon', 'Muçarela', 'Cheddar', 'Alface', 'Tomate', 'Cebola', 'Batata frita'],
    badges: ['mais-vendido'],
    ordem: 9,
    grupos: ['turbine-lanche'],
  },

  /* --------------------------------------------------------- Porções */
  {
    slug: 'porcao-salame',
    nome: 'Salame',
    descricao: 'Fatiado no capricho para você curtir.',
    preco: 2300,
    categoria: 'porcoes',
    imagem: foto('photo-1529042410759-befb1204b468'),
    ingredientes: ['Salame'],
    ordem: 1,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'porcao-frios',
    nome: 'Frios',
    descricao: 'Seleção especial de frios: presunto em cubinhos, salame e azeitonas.',
    preco: 3500,
    categoria: 'porcoes',
    imagem: foto('photo-1529042410759-befb1204b468'),
    ingredientes: ['Presunto em cubinhos', 'Salame', 'Azeitonas'],
    ordem: 2,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'batata-simples-700g',
    nome: 'Batata Simples 700g',
    descricao: 'Porção generosa de batata frita crocante e sequinha.',
    preco: 3300,
    categoria: 'porcoes',
    imagem: foto('photo-1573080496219-bb080dd4f877'),
    ingredientes: ['Batata frita'],
    ordem: 3,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'batata-completa-700g',
    nome: 'Batata Completa 700g',
    descricao: 'Batata frita com queijo, cheddar, bacon e catupiry.',
    preco: 4000,
    categoria: 'porcoes',
    imagem: foto('photo-1573080496219-bb080dd4f877'),
    ingredientes: ['Batata frita', 'Queijo', 'Cheddar', 'Bacon', 'Catupiry'],
    badges: ['mais-vendido'],
    ordem: 4,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'frango-crocante',
    nome: 'Frango Crocante',
    descricao: 'Iscas de frango empanadas e crocantes. Acompanha batata 700g.',
    preco: 4000,
    categoria: 'porcoes',
    imagem: foto('photo-1626645738196-c2a7c87a8f58'),
    ingredientes: ['Iscas de frango empanadas', 'Batata frita 700g'],
    ordem: 5,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'file-de-tilapia-crocante',
    nome: 'Filé de Tilápia Crocante',
    descricao: 'Filés de tilápia empanados e crocantes. Acompanha batata 700g.',
    preco: 5500,
    categoria: 'porcoes',
    imagem: foto('photo-1544025162-d76694265947'),
    ingredientes: ['Filé de tilápia empanado', 'Batata frita 700g'],
    ordem: 6,
    grupos: ['acompanhamentos-porcao'],
  },
  {
    slug: 'bolinho-de-carne-seca',
    nome: 'Bolinho de Carne Seca',
    descricao: 'Bolinho de carne seca crocante por fora e macio por dentro. Acompanha molho da casa.',
    preco: 3500,
    categoria: 'porcoes',
    imagem: foto('photo-1626645738196-c2a7c87a8f58'),
    ingredientes: ['Carne seca', 'Molho da casa'],
    ordem: 7,
    grupos: ['acompanhamentos-porcao'],
  },

  /* --------------------------------------------------------- Bebidas */
  {
    slug: 'coca-cola-lata-350ml',
    nome: 'Coca-Cola Lata 350ml',
    descricao: 'Refrigerante gelado, lata 350ml.',
    preco: 600,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 1,
  },
  {
    slug: 'coca-cola-zero-lata-350ml',
    nome: 'Coca-Cola Zero Lata 350ml',
    descricao: 'Refrigerante zero açúcar gelado, lata 350ml.',
    preco: 600,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 2,
  },
  {
    slug: 'guarana-antarctica-lata-350ml',
    nome: 'Guaraná Antarctica Lata 350ml',
    descricao: 'Refrigerante gelado, lata 350ml.',
    preco: 600,
    categoria: 'bebidas',
    imagem: foto('photo-1624517452488-04869289c4ca'),
    ordem: 3,
  },
  {
    slug: 'fanta-laranja-lata-350ml',
    nome: 'Fanta Laranja Lata 350ml',
    descricao: 'Refrigerante gelado, lata 350ml.',
    preco: 600,
    categoria: 'bebidas',
    imagem: foto('photo-1600271886742-f049cd451bba'),
    ordem: 4,
  },
  {
    slug: 'sprite-lata-350ml',
    nome: 'Sprite Lata 350ml',
    descricao: 'Refrigerante gelado, lata 350ml.',
    preco: 600,
    categoria: 'bebidas',
    imagem: foto('photo-1600271886742-f049cd451bba'),
    ordem: 5,
  },
  {
    slug: 'coca-cola-600ml-pet',
    nome: 'Coca-Cola 600ml PET',
    descricao: 'Garrafa PET 600ml.',
    preco: 800,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 6,
  },
  {
    slug: 'coca-cola-zero-600ml-pet',
    nome: 'Coca-Cola Zero 600ml PET',
    descricao: 'Garrafa PET 600ml, zero açúcar.',
    preco: 800,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 7,
  },
  {
    slug: 'coca-cola-1-litro-pet',
    nome: 'Coca-Cola 1 Litro PET',
    descricao: 'Garrafa PET 1 litro.',
    preco: 1000,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 8,
  },
  {
    slug: 'coca-cola-zero-1-litro-pet',
    nome: 'Coca-Cola Zero 1 Litro PET',
    descricao: 'Garrafa PET 1 litro, zero açúcar.',
    preco: 1000,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 9,
  },
  {
    slug: 'coca-cola-2-litros-pet',
    nome: 'Coca-Cola 2 Litros PET',
    descricao: 'Garrafa PET 2 litros, perfeita para dividir na mesa.',
    preco: 1300,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 10,
  },
  {
    slug: 'coca-cola-zero-2-litros-pet',
    nome: 'Coca-Cola Zero 2 Litros PET',
    descricao: 'Garrafa PET 2 litros, zero açúcar.',
    preco: 1300,
    categoria: 'bebidas',
    imagem: foto('photo-1554866585-cd94860890b7'),
    ordem: 11,
  },
  {
    slug: 'guarana-antarctica-2-litros-pet',
    nome: 'Guaraná Antarctica 2 Litros PET',
    descricao: 'Garrafa PET 2 litros.',
    preco: 1000,
    categoria: 'bebidas',
    imagem: foto('photo-1624517452488-04869289c4ca'),
    ordem: 12,
  },
  {
    slug: 'fanta-laranja-2-litros-pet',
    nome: 'Fanta Laranja 2 Litros PET',
    descricao: 'Garrafa PET 2 litros.',
    preco: 1100,
    categoria: 'bebidas',
    imagem: foto('photo-1600271886742-f049cd451bba'),
    ordem: 13,
  },
  {
    slug: 'suco-prats-laranja-900ml',
    nome: 'Suco Prats Laranja 900ml',
    descricao: 'Suco de laranja, garrafa 900ml.',
    preco: 1500,
    categoria: 'bebidas',
    imagem: foto('photo-1600271886742-f049cd451bba'),
    ordem: 14,
  },
];

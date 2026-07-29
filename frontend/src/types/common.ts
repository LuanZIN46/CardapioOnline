/** Valor monetário sempre em centavos de real para evitar erros de ponto flutuante. */
export type Money = number;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Identifiable {
  id: string;
}

export interface Orderable {
  displayOrder: number;
}

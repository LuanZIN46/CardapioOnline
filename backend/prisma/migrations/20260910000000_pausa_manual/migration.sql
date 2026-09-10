-- Pausa manual do atendimento.
-- Nulo = a loja segue o horário normal. Preenchido = fechada até aquele instante,
-- que é sempre a virada do dia; passado esse momento a coluna vira histórico
-- inofensivo e a loja volta a abrir sozinha.
ALTER TABLE "empresas" ADD COLUMN "fechadoAte" TIMESTAMP(3);

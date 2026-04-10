'use client';

import { useMemo } from 'react';
import { Tarefa } from '@/lib/types';

interface ContadorResult {
  total: number;
  concluidas: number;
  pendentes: number;
}

export function useContadorDeTarefas(tarefas: Tarefa[]): ContadorResult {
  const contador = useMemo(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.concluida).length;
    const pendentes = total - concluidas;
    return { total, concluidas, pendentes };
  }, [tarefas]);

  return contador;
}

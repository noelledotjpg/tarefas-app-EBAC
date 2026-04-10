import { Tarefa } from './types';

export async function getTarefas(): Promise<Tarefa[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  return [];
}

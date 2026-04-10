import { renderHook } from '@testing-library/react';
import { useContadorDeTarefas } from '@/hooks/useContadorDeTarefas';
import { Tarefa } from '@/lib/types';

describe('useContadorDeTarefas', () => {
  const tarefas: Tarefa[] = [
    { id: 1, titulo: 'A', data: null, concluida: false },
    { id: 2, titulo: 'B', data: null, concluida: true  },
    { id: 3, titulo: 'C', data: null, concluida: false },
    { id: 4, titulo: 'D', data: null, concluida: true  },
  ];

  it('deve retornar o total correto', () => {
    const { result } = renderHook(() => useContadorDeTarefas(tarefas));
    expect(result.current.total).toBe(4);
  });

  it('deve retornar o número correto de concluídas', () => {
    const { result } = renderHook(() => useContadorDeTarefas(tarefas));
    expect(result.current.concluidas).toBe(2);
  });

  it('deve retornar o número correto de pendentes', () => {
    const { result } = renderHook(() => useContadorDeTarefas(tarefas));
    expect(result.current.pendentes).toBe(2);
  });

  it('deve retornar zeros para lista vazia', () => {
    const { result } = renderHook(() => useContadorDeTarefas([]));
    expect(result.current.total).toBe(0);
    expect(result.current.concluidas).toBe(0);
    expect(result.current.pendentes).toBe(0);
  });

  it('total deve ser igual a concluidas + pendentes', () => {
    const { result } = renderHook(() => useContadorDeTarefas(tarefas));
    const { total, concluidas, pendentes } = result.current;
    expect(total).toBe(concluidas + pendentes);
  });

  it('deve funcionar quando todas estão pendentes', () => {
    const todas: Tarefa[] = [
      { id: 1, titulo: 'A', data: null, concluida: false },
      { id: 2, titulo: 'B', data: null, concluida: false },
    ];
    const { result } = renderHook(() => useContadorDeTarefas(todas));
    expect(result.current.concluidas).toBe(0);
    expect(result.current.pendentes).toBe(2);
  });

  it('deve funcionar quando todas estão concluídas', () => {
    const todas: Tarefa[] = [
      { id: 1, titulo: 'A', data: null, concluida: true },
      { id: 2, titulo: 'B', data: null, concluida: true },
    ];
    const { result } = renderHook(() => useContadorDeTarefas(todas));
    expect(result.current.concluidas).toBe(2);
    expect(result.current.pendentes).toBe(0);
  });

  it('deve funcionar com uma única tarefa', () => {
    const { result } = renderHook(() =>
      useContadorDeTarefas([{ id: 1, titulo: 'Solo', data: null, concluida: false }])
    );
    expect(result.current.total).toBe(1);
  });
});

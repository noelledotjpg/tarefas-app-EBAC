'use client';

import { useState } from 'react';
import { Tarefa } from '@/lib/types';
import { NovaTarefa } from './NovaTarefa';
import { useContadorDeTarefas } from '@/hooks/useContadorDeTarefas';

type Aba = 'todas' | 'pendentes' | 'concluidas';

interface ListaDeTarefasProps {
  tarefasIniciais: Tarefa[];
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function ListaDeTarefas({ tarefasIniciais }: ListaDeTarefasProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasIniciais);
  const [aba, setAba] = useState<Aba>('todas');
  const contador = useContadorDeTarefas(tarefas);

  const filtradas =
    aba === 'pendentes' ? tarefas.filter((t) => !t.concluida)
    : aba === 'concluidas' ? tarefas.filter((t) => t.concluida)
    : tarefas;

  function adicionarTarefa(nova: Tarefa) {
    setTarefas((prev) => [...prev, nova]);
  }

  function toggleTarefa(id: number) {
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  }

  function removerTarefa(id: number) {
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }

  function limparConcluidas() {
    setTarefas((prev) => prev.filter((t) => !t.concluida));
  }

  return (
    <div className="lista-container">
      <div className="contador-badges">
        <span className="badge total" data-testid="badge-total">{contador.total} total</span>
        <span className="badge pendentes" data-testid="badge-pendentes">{contador.pendentes} pendentes</span>
        <span className="badge concluidas" data-testid="badge-concluidas">{contador.concluidas} concluídas</span>
      </div>

      <NovaTarefa onAdicionar={adicionarTarefa} />

      <div className="abas-container">
        <div className="abas" role="tablist">
          {(['todas', 'pendentes', 'concluidas'] as Aba[]).map((a) => (
            <button
              key={a}
              role="tab"
              aria-selected={aba === a}
              className={`aba ${aba === a ? 'ativa' : ''}`}
              onClick={() => setAba(a)}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>

        <ul className="tarefas-lista" aria-label="Lista de tarefas" role="tabpanel">
          {filtradas.length === 0 ? (
            <li className="vazia">[ nenhuma tarefa ]</li>
          ) : (
            filtradas.map((tarefa) => (
              <li key={tarefa.id} className={`tarefa-item ${tarefa.concluida ? 'concluida' : ''}`}>
                <label className="tarefa-label">
                  <input
                    type="checkbox"
                    checked={tarefa.concluida}
                    onChange={() => toggleTarefa(tarefa.id)}
                    aria-label={`Marcar "${tarefa.titulo}" como ${tarefa.concluida ? 'pendente' : 'concluída'}`}
                  />
                  <div className="tarefa-body">
                    <span className="tarefa-titulo">{tarefa.titulo}</span>
                    {tarefa.data && (
                      <span className="tarefa-data">@ {fmtData(tarefa.data)}</span>
                    )}
                  </div>
                </label>
                <button
                  className="btn-remover"
                  onClick={() => removerTarefa(tarefa.id)}
                  aria-label={`Remover "${tarefa.titulo}"`}
                >x</button>
              </li>
            ))
          )}
        </ul>
      </div>

      {contador.concluidas > 0 && (
        <div className="footer-row">
          <button className="btn btn-danger" onClick={limparConcluidas}>
            LIMPAR CONCLUÍDAS
          </button>
        </div>
      )}
    </div>
  );
}

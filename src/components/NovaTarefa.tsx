'use client';

import { useState } from 'react';
import { Tarefa } from '@/lib/types';

interface NovaTarefaProps {
  onAdicionar: (tarefa: Tarefa) => void;
}

export function NovaTarefa({ onAdicionar }: NovaTarefaProps) {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro('o título da tarefa não pode ser vazio.');
      return;
    }
    onAdicionar({
      id: Date.now(),
      titulo: titulo.trim(),
      data: data || null,
      concluida: false,
    });
    setTitulo('');
    setData('');
    setErro('');
  }

  return (
    <form onSubmit={handleSubmit} className="nova-tarefa-form" noValidate>
      <div className="form-row">
        <div className="field f-titulo">
          <label htmlFor="titulo-tarefa">TÍTULO</label>
          <input
            id="titulo-tarefa"
            type="text"
            value={titulo}
            onChange={(e) => { setTitulo(e.target.value); if (erro) setErro(''); }}
            placeholder="Descrição da tarefa..."
            aria-invalid={!!erro}
            aria-describedby={erro ? 'erro-titulo' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="data-tarefa">DATA</label>
          <input
            id="data-tarefa"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <button type="submit" disabled={!titulo.trim()}>ADICIONAR</button>
      </div>
      {erro && (
        <span id="erro-titulo" role="alert" className="erro">{erro}</span>
      )}
    </form>
  );
}

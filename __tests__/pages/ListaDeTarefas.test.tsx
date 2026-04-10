import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaDeTarefas } from '@/components/ListaDeTarefas';
import { Tarefa } from '@/lib/types';

describe('ListaDeTarefas', () => {
  const tarefas: Tarefa[] = [
    { id: 1, titulo: 'Estudar Next.js',   data: null,         concluida: false },
    { id: 2, titulo: 'Configurar Jest',   data: '2025-12-01', concluida: true  },
    { id: 3, titulo: 'Criar componentes', data: null,         concluida: false },
  ];

  // ── Renderização ────────────────────────────────────────────────────────────

  it('deve renderizar todos os títulos das tarefas', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByText('Estudar Next.js')).toBeInTheDocument();
    expect(screen.getByText('Configurar Jest')).toBeInTheDocument();
    expect(screen.getByText('Criar componentes')).toBeInTheDocument();
  });

  it('deve renderizar a lista como tabpanel com aria-label correto', () => {
    // A <ul> tem role="tabpanel" explícito pois está dentro da estrutura de abas.
    // O Testing Library respeita roles ARIA explícitos, ignorando o role
    // implícito da tag HTML. Por isso usamos tabpanel, não list.
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByRole('tabpanel', { name: /lista de tarefas/i })).toBeInTheDocument();
  });

  it('deve renderizar o número correto de itens', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('deve exibir mensagem quando a lista está vazia', () => {
    render(<ListaDeTarefas tarefasIniciais={[]} />);
    expect(screen.getByText(/nenhuma tarefa/i)).toBeInTheDocument();
  });

  it('deve exibir a data formatada quando informada', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByText(/01\/12\/2025/)).toBeInTheDocument();
  });

  // ── Badges ──────────────────────────────────────────────────────────────────

  it('deve exibir badge com total correto', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByTestId('badge-total')).toHaveTextContent('3 total');
  });

  it('deve exibir badge de pendentes correto', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByTestId('badge-pendentes')).toHaveTextContent('2 pendentes');
  });

  it('deve exibir badge de concluídas correto', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByTestId('badge-concluidas')).toHaveTextContent('1 concluídas');
  });

  // ── Adição ──────────────────────────────────────────────────────────────────

  it('deve adicionar nova tarefa à lista', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.type(screen.getByLabelText(/título/i), 'Tarefa nova');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(screen.getByText('Tarefa nova')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('deve atualizar badge total ao adicionar tarefa', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.type(screen.getByLabelText(/título/i), 'Extra');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(screen.getByTestId('badge-total')).toHaveTextContent('4 total');
  });

  // ── Toggle ───────────────────────────────────────────────────────────────────

  it('deve marcar tarefa como concluída ao clicar no checkbox', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it('deve atualizar badge concluídas ao marcar tarefa', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByTestId('badge-concluidas')).toHaveTextContent('2 concluídas');
  });

  // ── Remoção ──────────────────────────────────────────────────────────────────

  it('deve remover tarefa ao clicar no botão remover', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getAllByRole('button', { name: /remover/i })[0]);
    expect(screen.queryByText('Estudar Next.js')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('deve atualizar badge total ao remover tarefa', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getAllByRole('button', { name: /remover/i })[0]);
    expect(screen.getByTestId('badge-total')).toHaveTextContent('2 total');
  });

  // ── Limpar concluídas ────────────────────────────────────────────────────────

  it('deve exibir botão limpar quando há tarefas concluídas', () => {
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    expect(screen.getByRole('button', { name: /limpar conclu/i })).toBeInTheDocument();
  });

  it('não deve exibir botão limpar quando não há concluídas', () => {
    render(<ListaDeTarefas tarefasIniciais={[{ id: 1, titulo: 'A', data: null, concluida: false }]} />);
    expect(screen.queryByRole('button', { name: /limpar conclu/i })).not.toBeInTheDocument();
  });

  it('deve remover todas as concluídas ao clicar em limpar', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getByRole('button', { name: /limpar conclu/i }));
    expect(screen.queryByText('Configurar Jest')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  // ── Abas ─────────────────────────────────────────────────────────────────────

  it('deve mostrar só pendentes na aba PENDENTES', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getByRole('tab', { name: /pendentes/i }));
    expect(screen.queryByText('Configurar Jest')).not.toBeInTheDocument();
    expect(screen.getByText('Estudar Next.js')).toBeInTheDocument();
  });

  it('deve mostrar só concluídas na aba CONCLUIDAS', async () => {
    const user = userEvent.setup();
    render(<ListaDeTarefas tarefasIniciais={tarefas} />);
    await user.click(screen.getByRole('tab', { name: /concluidas/i }));
    expect(screen.getByText('Configurar Jest')).toBeInTheDocument();
    expect(screen.queryByText('Estudar Next.js')).not.toBeInTheDocument();
  });
});

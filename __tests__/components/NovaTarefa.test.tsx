import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovaTarefa } from '@/components/NovaTarefa';
import { Tarefa } from '@/lib/types';

describe('NovaTarefa', () => {
  const mockOnAdicionar = jest.fn();

  beforeEach(() => {
    mockOnAdicionar.mockClear();
  });

  // ── Renderização ────────────────────────────────────────────────────────────

  it('deve renderizar o campo de título', () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it('deve renderizar o campo de data', () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de adicionar', () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
  });

  it('botão deve estar desabilitado quando o input está vazio', () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeDisabled();
  });

  it('botão deve ficar habilitado ao digitar um título', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    await user.type(screen.getByLabelText(/título/i), 'Estudar testes');
    expect(screen.getByRole('button', { name: /adicionar/i })).not.toBeDisabled();
  });

  // ── Validação ───────────────────────────────────────────────────────────────
  //
  // Usamos fireEvent.submit + act para disparar submit com campo vazio.
  // O userEvent não interage com botões desabilitados, então esta é a forma
  // correta de testar a validação. O act() garante que o React processe
  // a atualização de estado (setErro) antes das asserções.

  it('deve exibir erro ao submeter formulário vazio', async () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    const form = screen.getByRole('button', { name: /adicionar/i }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('não deve exibir erro antes de submeter', () => {
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('deve remover o erro ao começar a digitar', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    const form = screen.getByRole('button', { name: /adicionar/i }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/título/i), 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── Submissão ───────────────────────────────────────────────────────────────

  it('deve chamar onAdicionar ao submeter com título válido', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    await user.type(screen.getByLabelText(/título/i), 'Minha tarefa');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(mockOnAdicionar).toHaveBeenCalledTimes(1);
  });

  it('deve criar a tarefa com concluida=false', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    await user.type(screen.getByLabelText(/título/i), 'Nova');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    const tarefa: Tarefa = mockOnAdicionar.mock.calls[0][0];
    expect(tarefa.concluida).toBe(false);
  });

  it('deve fazer trim no título da tarefa', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    await user.type(screen.getByLabelText(/título/i), '  Tarefa com espaços  ');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    const tarefa: Tarefa = mockOnAdicionar.mock.calls[0][0];
    expect(tarefa.titulo).toBe('Tarefa com espaços');
  });

  it('deve limpar o input após submissão', async () => {
    const user = userEvent.setup();
    render(<NovaTarefa onAdicionar={mockOnAdicionar} />);
    const input = screen.getByLabelText(/título/i);
    await user.type(input, 'Tarefa');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(input).toHaveValue('');
  });
});

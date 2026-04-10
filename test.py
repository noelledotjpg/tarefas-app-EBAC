"""
setup_tests.py
Cria a estrutura de pastas e arquivos de teste do projeto tarefas-app,
depois executa `npm test` automaticamente.
"""

import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
FILES = {}

# ── jest.config.js ────────────────────────────────────────────────────────────
FILES["jest.config.js"] = """\
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
};

module.exports = config;
"""

# ── jest.setup.ts ─────────────────────────────────────────────────────────────
FILES["jest.setup.ts"] = """\
import '@testing-library/jest-dom';
"""

# ── .babelrc ──────────────────────────────────────────────────────────────────
FILES[".babelrc"] = """\
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "current" } }],
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript"
  ]
}
"""

# ── __tests__/components/NovaTarefa.test.tsx ──────────────────────────────────
FILES["__tests__/components/NovaTarefa.test.tsx"] = """\
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
"""

# ── __tests__/hooks/useContadorDeTarefas.test.ts ──────────────────────────────
FILES["__tests__/hooks/useContadorDeTarefas.test.ts"] = """\
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
"""

# ── __tests__/pages/ListaDeTarefas.test.tsx ───────────────────────────────────
FILES["__tests__/pages/ListaDeTarefas.test.tsx"] = """\
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
"""


def criar_arquivo(caminho_relativo: str, conteudo: str) -> None:
    caminho = os.path.join(ROOT, caminho_relativo.replace("/", os.sep))
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"  [ok] {caminho_relativo}")


def rodar_comando(cmd: list) -> int:
    print(f"\n>>> {' '.join(cmd)}\n{'─' * 50}")
    return subprocess.run(cmd, cwd=ROOT, shell=(sys.platform == "win32")).returncode


def main() -> None:
    print("=" * 50)
    print("  SETUP DE TESTES — tarefas-app")
    print("=" * 50)

    print("\n[1/2] Criando arquivos...\n")
    for caminho, conteudo in FILES.items():
        criar_arquivo(caminho, conteudo)
    print(f"\n  {len(FILES)} arquivo(s) criado(s) com sucesso.")

    print("\n[2/2] Executando testes...\n")
    code = rodar_comando(["npm", "test"])

    print("\n" + "=" * 50)
    if code == 0:
        print("  TESTES PASSARAM com sucesso!")
    else:
        print(f"  FALHA nos testes (código de saída: {code})")
    print("=" * 50)
    sys.exit(code)


if __name__ == "__main__":
    main()

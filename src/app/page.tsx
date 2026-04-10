import { getTarefas } from '@/lib/tarefas-data';
import { ListaDeTarefas } from '@/components/ListaDeTarefas';

export default async function Home() {
  const tarefas = await getTarefas();

  return (
    <main className="main">
      <div className="frame">
        <span className="frame-label">/// GERENCIADOR DE TAREFAS</span>
        <div className="frame-inner">
          <ListaDeTarefas tarefasIniciais={tarefas} />
        </div>
      </div>
    </main>
  );
}

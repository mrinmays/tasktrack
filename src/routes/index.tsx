import { createFileRoute } from '@tanstack/react-router';
import { KanbanBoard } from '@/modules/kanban';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return <KanbanBoard />;
}

import { Table, Button, Badge } from 'react-bootstrap';
import type { Task } from '../types';

type Props = {
    tasks: Task[];
    onDelete: (id: number) => void;
};

export default function TaskList({ tasks, onDelete }: Props) {
    if (tasks.length === 0) {
        return <div className="text-muted py-3">No tasks yet</div>;
    }

    return (
        <Table striped hover responsive size="sm" className="mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {tasks.map((t) => (
                    <tr key={t.id}>
                        <td className="text-muted">{t.id}</td>
                        <td>{t.title}</td>
                        <td>
                            <Badge bg={t.priority === 2 ? 'danger' : t.priority === 1 ? 'warning' : 'secondary'}>
                                {t.priority}
                            </Badge>
                        </td>
                        <td className="text-end">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDelete(t.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

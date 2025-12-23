import type { Task } from '../types';

type Props = {
    task: Task;
    onDelete: (id: number) => void;
};

export default function TaskItemRow({ task, onDelete }: Props) {
    return (
        <tr>
            <td style={{ width: 60 }} className="text-muted">{task.id}</td>
            <td>
                <div className="fw-semibold">{task.title}</div>
                {task.description && (
                    <div className="text-muted small">{task.description}</div>
                )}
            </td>
            <td style={{ width: 120 }}>
                <span className="badge text-bg-secondary">{task.priority}</span>
            </td>
            <td style={{ width: 220 }} className="text-muted small">
                {task.userFullName}
                <div>{task.userEmail}</div>
            </td>
            <td style={{ width: 220 }} className="text-muted small">
                {task.dueDateUtc ? new Date(task.dueDateUtc).toLocaleString() : '—'}
            </td>
            <td style={{ width: 120 }} className="text-end">
                <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(task.id)}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}

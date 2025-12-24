import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type { Task, UpdateTaskPayload, TaskPriority } from '../types';

type Props = {
    show: boolean;
    task: Task | null;
    onClose: () => void;
    onSubmit: (payload: UpdateTaskPayload) => void;
};

export default function TaskEditModal({ show, task, onClose, onSubmit }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueLocal, setDueLocal] = useState(''); // datetime-local string
    const [priority, setPriority] = useState<TaskPriority>(1);

    // if you store tags as {id,name} in the task, send ids on update
    const [tags, setTags] = useState<number[]>([]);

    const [userFullName, setUserFullName] = useState('');
    const [userTelephone, setUserTelephone] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // load selected task into state when modal opens
    useEffect(() => {
        if (!task) return;

        setTitle(task.title ?? '');
        setDescription(task.description ?? '');
        setPriority(task.priority ?? 1);

        setUserFullName(task.userFullName ?? '');
        setUserTelephone(task.userTelephone ?? '');
        setUserEmail(task.userEmail ?? '');

        setTags(task.tags?.map(t => t.id) ?? []);

        // Convert UTC string -> local datetime-local value
        // datetime-local expects: YYYY-MM-DDTHH:mm
        if (task.dueDateUtc) {
            const d = new Date(task.dueDateUtc);
            const pad = (n: number) => String(n).padStart(2, '0');
            const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
                d.getHours()
            )}:${pad(d.getMinutes())}`;
            setDueLocal(localStr);
        } else {
            setDueLocal('');
        }
    }, [task]);

    const canSubmit = useMemo(() => {
        return !!task && title.trim().length > 0;
    }, [task, title]);

    if (!task) return null;

    const handleSave = () => {
        const payload: UpdateTaskPayload = {
            id: task.id,
            title: title.trim(),
            description: description.trim(),
            // send as UTC ISO string or null (depends on your API contract)
            dueDateUtc: dueLocal ? new Date(dueLocal).toISOString() : null,
            priority,
            userFullName: userFullName.trim(),
            userTelephone: userTelephone.trim(),
            userEmail: userEmail.trim(),
            tags,
        };

        onSubmit(payload);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Task #{task.id}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Due date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={dueLocal}
                            onChange={(e) => setDueLocal(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        >
                            <option value={0}>Low</option>
                            <option value={1}>Medium</option>
                            <option value={2}>High</option>
                        </Form.Select>
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-2">
                        <Form.Label>Full name</Form.Label>
                        <Form.Control value={userFullName} onChange={(e) => setUserFullName(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Telephone</Form.Label>
                        <Form.Control value={userTelephone} onChange={(e) => setUserTelephone(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Tag IDs</Form.Label>
                        <Form.Control
                            placeholder="e.g. 1,2,5"
                            value={tags.join(',')}
                            onChange={(e) => {
                                const ids = e.target.value
                                    .split(',')
                                    .map(s => s.trim())
                                    .filter(Boolean)
                                    .map(Number)
                                    .filter(n => Number.isFinite(n));
                                setTags(ids);
                            }}
                        />
                        <div className="text-muted small mt-1">
                            Temporary UI: type tag IDs. (Later you can reuse your Tag picker.)
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={!canSubmit} onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

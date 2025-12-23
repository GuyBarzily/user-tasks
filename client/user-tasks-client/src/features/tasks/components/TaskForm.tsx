import { useMemo, useState } from 'react';
import { Button, Col, Form, Row, InputGroup, Badge } from 'react-bootstrap';
import type { CreateTaskPayload, TaskPriority } from '../types';

type Props = {
    onSubmit: (payload: CreateTaskPayload) => void;
    isSubmitting?: boolean;
};

const PRIORITY_LABEL: Record<number, string> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
};

export default function TaskForm({ onSubmit, isSubmitting = false }: Props) {
    // task fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueLocal, setDueLocal] = useState<string>(''); // datetime-local string
    const [priority, setPriority] = useState<TaskPriority>(1);

    // user fields
    const [userFullName, setUserFullName] = useState('');
    const [userTelephone, setUserTelephone] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // tags
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const titleError = useMemo(() => {
        if (!title.trim()) return 'Title is required';
        if (title.trim().length > 200) return 'Title must be at most 200 chars';
        return '';
    }, [title]);

    const emailError = useMemo(() => {
        if (!userEmail.trim()) return '';
        // light validation (don’t overdo)
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
        return ok ? '' : 'Email looks invalid';
    }, [userEmail]);

    const canSubmit = !titleError && !emailError && !isSubmitting;

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;

        // avoid duplicates (case-insensitive)
        const exists = tags.some(x => x.toLowerCase() === t.toLowerCase());
        if (exists) {
            setTagInput('');
            return;
        }

        setTags(prev => [...prev, t]);
        setTagInput('');
    };

    const removeTag = (t: string) => {
        setTags(prev => prev.filter(x => x !== t));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) return;

        const payload: CreateTaskPayload = {
            title: title.trim(),
            description: description.trim(),
            dueDateUtc: dueLocal ? new Date(dueLocal).toISOString() : null,
            priority,
            userFullName: userFullName.trim(),
            userTelephone: userTelephone.trim(),
            userEmail: userEmail.trim(),
            tags,
        };

        onSubmit(payload);

        // reset (keep user details optionally; for now reset all)
        setTitle('');
        setDescription('');
        setDueLocal('');
        setPriority(1);
        setUserFullName('');
        setUserTelephone('');
        setUserEmail('');
        setTags([]);
        setTagInput('');
    };

    return (
        <Form onSubmit={submit}>
            <Row className="g-3">
                {/* Task section */}
                <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-semibold">Create Task</div>
                        <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? 'Saving…' : 'Add Task'}
                        </Button>
                    </div>
                </Col>

                <Col md={8}>
                    <Form.Group>
                        <Form.Label>Title *</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Interview assignment"
                            isInvalid={!!titleError}
                        />
                        {titleError && (
                            <Form.Control.Feedback type="invalid">
                                {titleError}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        >
                            <option value={0}>Low</option>
                            <option value={1}>Medium</option>
                            <option value={2}>High</option>
                        </Form.Select>
                        <div className="small text-muted mt-1">
                            Selected: {PRIORITY_LABEL[priority]}
                        </div>
                    </Form.Group>
                </Col>

                <Col xs={12}>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details…"
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Due date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={dueLocal}
                            onChange={(e) => setDueLocal(e.target.value)}
                        />
                        <div className="small text-muted mt-1">
                            Saved as UTC in the API
                        </div>
                    </Form.Group>
                </Col>

                {/* Tags section */}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Tags</Form.Label>
                        <InputGroup>
                            <Form.Control
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Type tag and press Add"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                            />
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={addTag}
                                disabled={!tagInput.trim()}
                            >
                                Add
                            </Button>
                        </InputGroup>

                        {tags.length > 0 && (
                            <div className="mt-2 d-flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <Badge
                                        bg="secondary"
                                        key={t}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to remove"
                                        onClick={() => removeTag(t)}
                                    >
                                        {t} ✕
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Form.Group>
                </Col>

                {/* User section */}
                <Col xs={12} className="pt-2">
                    <div className="fw-semibold">User Details</div>
                    <div className="text-muted small">
                        (Optional for now unless your backend requires them)
                    </div>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Full name</Form.Label>
                        <Form.Control
                            value={userFullName}
                            onChange={(e) => setUserFullName(e.target.value)}
                            placeholder="Guy Barzily"
                        />
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Telephone</Form.Label>
                        <Form.Control
                            value={userTelephone}
                            onChange={(e) => setUserTelephone(e.target.value)}
                            placeholder="+972-50-1234567"
                        />
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="guy@example.com"
                            isInvalid={!!emailError}
                        />
                        {emailError && (
                            <Form.Control.Feedback type="invalid">
                                {emailError}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
}

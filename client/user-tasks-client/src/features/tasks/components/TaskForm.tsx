import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Form, Row, InputGroup, Badge, ListGroup, Spinner } from 'react-bootstrap';
import type { CreateTaskPayload, TaskPriority } from "../types";
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { searchTags, type TagSuggestion } from "../tagsApi";

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
    const [tagInput, setTagInput] = useState("");
    const [selectedTags, setSelectedTags] = useState<TagSuggestion[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);

    const tagBoxRef = useRef<HTMLDivElement>(null);

    const debouncedTagQuery = useDebouncedValue(tagInput, 250);

    const titleError = useMemo(() => {
        if (!title.trim()) return 'Title is required';
        if (title.trim().length > 200) return 'Title must be at most 200 chars';
        return '';
    }, [title]);

    const emailError = useMemo(() => {
        if (!userEmail.trim()) return '';
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
        return ok ? '' : 'Email looks invalid';
    }, [userEmail]);

    const canSubmit = !titleError && !emailError && !isSubmitting;

    const selectTag = (tag: TagSuggestion) => {
        const exists = selectedTags.some(t => t.id === tag.id);
        if (exists) return;

        setSelectedTags(prev => [...prev, tag]);
        setTagInput("");
        setTagSuggestions([]);
        setTagsOpen(false);
    };

    const removeTag = (id: number) => {
        setSelectedTags(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        let cancelled = false;

        async function run() {
            const q = debouncedTagQuery.trim();
            if (!q) {
                setTagSuggestions([]);
                setTagsLoading(false);
                return;
            }

            setTagsLoading(true);
            try {
                const res = await searchTags(q);
                if (cancelled) return;

                // filter out already-selected tags by id
                const selectedIds = new Set(selectedTags.map(t => t.id));
                const filtered = res.filter(s => !selectedIds.has(s.id));

                setTagSuggestions(filtered);
                setTagsOpen(true);
            } finally {
                if (!cancelled) setTagsLoading(false);
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [debouncedTagQuery, selectedTags]);

    // ✅ Close suggestions on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!tagBoxRef.current) return;
            if (!tagBoxRef.current.contains(e.target as Node)) setTagsOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

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
            tags: selectedTags.map(t => t.id), // ✅ send IDs
        };

        onSubmit(payload);

        // reset
        setTitle("");
        setDescription("");
        setDueLocal("");
        setPriority(1);
        setUserFullName("");
        setUserTelephone("");
        setUserEmail("");
        setSelectedTags([]);
        setTagInput("");
        setTagSuggestions([]);
        setTagsOpen(false);
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

                {/* ✅ Tags section with debounced AJAX + suggestions */}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Tags</Form.Label>

                        <div ref={tagBoxRef} style={{ position: 'relative' }}>
                            <InputGroup>
                                <Form.Control
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Type to search tags…"
                                    onFocus={() => {
                                        if (tagSuggestions.length > 0) setTagsOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // do nothing
                                        }
                                        if (e.key === 'Escape') {
                                            setTagsOpen(false);
                                        }
                                    }}

                                />
                            </InputGroup>

                            {tagsLoading && (
                                <div className="small text-muted mt-1">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Searching…
                                </div>
                            )}

                            {tagsOpen && tagSuggestions.length > 0 && (
                                <ListGroup
                                    className="shadow"
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        zIndex: 10,
                                        marginTop: 6,
                                        maxHeight: 220,
                                        overflowY: 'auto',
                                    }}
                                >
                                    {tagSuggestions.map((s) => (
                                        <ListGroup.Item
                                            action
                                            key={s.id}
                                            onClick={() => selectTag(s)} // ✅ pass object
                                        >
                                            {s.name}
                                        </ListGroup.Item>
                                    ))}

                                </ListGroup>
                            )}
                        </div>

                        {selectedTags.length > 0 && (
                            <div className="mt-2 d-flex flex-wrap gap-2">
                                {selectedTags.map((t) => (
                                    <Badge
                                        bg="secondary"
                                        key={t.id}
                                        style={{ cursor: "pointer" }}
                                        title="Click to remove"
                                        onClick={() => removeTag(t.id)} // ✅ remove by id
                                    >
                                        {t.name} ✕
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

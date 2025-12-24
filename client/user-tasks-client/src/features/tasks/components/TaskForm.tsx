import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Col, Form, InputGroup, ListGroup, Row, Spinner } from "react-bootstrap";

import type { CreateTaskPayload, TaskPriority } from "../types";
import type { TagSuggestion } from "../tagsApi";
import { searchTags } from "../tagsApi";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

import { validateTaskForm, isValid, shouldShowError } from "../validation";

type Props = {
    onSubmit: (payload: CreateTaskPayload) => void;
    isSubmitting?: boolean;
    onAddTagClick: () => void;

};

const PRIORITY_LABEL: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
};

export default function TaskForm({ onSubmit, isSubmitting = false, onAddTagClick }: Props) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // task
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueLocal, setDueLocal] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(1);

    // user
    const [userFullName, setUserFullName] = useState("");
    const [userTelephone, setUserTelephone] = useState("");
    const [userEmail, setUserEmail] = useState("");

    // tags
    const [tagInput, setTagInput] = useState("");
    const [selectedTags, setSelectedTags] = useState<TagSuggestion[]>([]);
    const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const tagBoxRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebouncedValue(tagInput, 250);

    const formValues = useMemo(
        () => ({
            title,
            description,
            dueLocal,
            priority,
            userFullName,
            userTelephone,
            userEmail,
            selectedTags,
        }),
        [title, description, dueLocal, priority, userFullName, userTelephone, userEmail, selectedTags]
    );

    const errors = useMemo(() => validateTaskForm(formValues), [formValues]);
    const showErrors = shouldShowError(hasSubmitted);
    const canSubmit = isValid(errors) && !isSubmitting;

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueLocal("");
        setPriority(1);

        setUserFullName("");
        setUserTelephone("");
        setUserEmail("");

        setSelectedTags([]);
        setTagInput("");
        setSuggestions([]);
        setIsDropdownOpen(false);

        setHasSubmitted(false);
    };

    const addTag = (tag: TagSuggestion) => {
        if (selectedTags.some((t) => t.id === tag.id)) return;

        setSelectedTags((prev) => [...prev, tag]);
        setTagInput("");
        setSuggestions([]);
        setIsDropdownOpen(false);
    };

    const removeTag = (id: number) => {
        setSelectedTags((prev) => prev.filter((t) => t.id !== id));
    };

    // search tags (debounced)
    useEffect(() => {
        let ignore = false;

        async function run() {
            const q = debouncedQuery.trim();

            if (!q) {
                setIsSearching(false);
                setSuggestions([]);
                setIsDropdownOpen(false);
                return;
            }

            setIsSearching(true);

            try {
                const res = await searchTags(q);
                if (ignore) return;

                const selectedIds = new Set(selectedTags.map((t) => t.id));
                const filtered = res.filter((s) => !selectedIds.has(s.id));

                setSuggestions(filtered);
                setIsDropdownOpen(filtered.length > 0);
            } finally {
                if (!ignore) setIsSearching(false);
            }
        }

        run();
        return () => {
            ignore = true;
        };
    }, [debouncedQuery, selectedTags]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!tagBoxRef.current) return;
            if (!tagBoxRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSubmitted(true);

        if (!canSubmit) return;

        const payload: CreateTaskPayload = {
            title: title.trim(),
            description: description.trim(),
            dueDateUtc: new Date(dueLocal).toISOString(),
            priority,

            userFullName: userFullName.trim(),
            userTelephone: userTelephone.trim(),
            userEmail: userEmail.trim(),

            tags: selectedTags.map((t) => t.id),
        };

        onSubmit(payload);
        resetForm();
    };

    return (
        <Form onSubmit={submit}>
            <Row className="g-3">
                <Col xs={12} className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">Create Task</div>

                    <div className="d-flex gap-2">
                        <Button
                            type="button"
                            variant="outline-primary"
                            onClick={onAddTagClick}
                            disabled={isSubmitting}
                        >
                            Add Tag
                        </Button>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving…" : "Add Task"}
                        </Button>
                    </div>
                </Col>


                <Col md={8}>
                    <Form.Group>
                        <Form.Label>Title *</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            isInvalid={showErrors && !!errors.title}
                        />
                        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Priority *</Form.Label>
                        <Form.Select
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        >
                            <option value={0}>Low</option>
                            <option value={1}>Medium</option>
                            <option value={2}>High</option>
                        </Form.Select>

                        <div className="small text-muted mt-1">Selected: {PRIORITY_LABEL[priority]}</div>
                    </Form.Group>
                </Col>

                <Col xs={12}>
                    <Form.Group>
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            isInvalid={showErrors && !!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Due date *</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={dueLocal}
                            onChange={(e) => setDueLocal(e.target.value)}
                            isInvalid={showErrors && !!errors.dueLocal}
                        />
                        <Form.Control.Feedback type="invalid">{errors.dueLocal}</Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Tags *</Form.Label>

                        <div ref={tagBoxRef} style={{ position: "relative" }}>
                            <InputGroup>
                                <Form.Control
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Search tags…"
                                    isInvalid={showErrors && !!errors.selectedTags}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setIsDropdownOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.preventDefault();
                                        if (e.key === "Escape") setIsDropdownOpen(false);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setIsDropdownOpen(false), 120);
                                    }}
                                />
                            </InputGroup>

                            <Form.Control.Feedback
                                type="invalid"
                                style={{ display: showErrors && errors.selectedTags ? "block" : "none" }}
                            >
                                {errors.selectedTags}
                            </Form.Control.Feedback>

                            {isSearching && debouncedQuery.trim() && (
                                <div className="small text-muted mt-1">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Searching…
                                </div>
                            )}

                            {isDropdownOpen && suggestions.length > 0 && (
                                <ListGroup
                                    className="shadow"
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        zIndex: 10,
                                        marginTop: 6,
                                        maxHeight: 220,
                                        overflowY: "auto",
                                    }}
                                >
                                    {suggestions.map((s) => (
                                        <ListGroup.Item action key={s.id} onMouseDown={() => addTag(s)}>
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
                                        onClick={() => removeTag(t.id)}
                                    >
                                        {t.name} ✕
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Form.Group>
                </Col>

                <Col xs={12} className="pt-2 fw-semibold">
                    User Details
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Full name *</Form.Label>
                        <Form.Control
                            value={userFullName}
                            onChange={(e) => setUserFullName(e.target.value)}
                            isInvalid={showErrors && !!errors.userFullName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.userFullName}</Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Telephone *</Form.Label>
                        <Form.Control
                            value={userTelephone}
                            onChange={(e) => setUserTelephone(e.target.value)}
                            isInvalid={showErrors && !!errors.userTelephone}
                        />
                        <Form.Control.Feedback type="invalid">{errors.userTelephone}</Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            isInvalid={showErrors && !!errors.userEmail}
                        />
                        <Form.Control.Feedback type="invalid">{errors.userEmail}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
}

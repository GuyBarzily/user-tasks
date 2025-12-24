import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

type Props = {
    show: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    isSubmitting?: boolean;
};

export default function TagCreateModal({ show, onClose, onSubmit, isSubmitting }: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (show) setName("");
    }, [show]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Tag</Modal.Title>
            </Modal.Header>

            <Form onSubmit={submit}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Tag name</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. performance"
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !name.trim()}>
                        {isSubmitting ? "Saving…" : "Add Tag"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

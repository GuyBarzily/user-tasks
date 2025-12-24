import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import type { Task } from "../types";

type Props = {
    tasks: Task[];
    onDelete: (id: number) => void;
    onUpdate: (task: Task) => void;
};

export default function TaskList({ tasks, onDelete, onUpdate }: Props) {
    if (tasks.length === 0) {
        return <div className="text-muted py-3">No tasks yet</div>;
    }

    return (
        <div className="d-flex flex-column gap-3">
            {tasks.map((t) => (
                <Card key={t.id} className="task-card border-0">
                    <Card.Body>
                        <Row className="align-items-start">
                            <Col md={8}>
                                <h5 className="mb-1">{t.title}</h5>
                                <div className="text-muted small mb-2">
                                    {t.description}
                                </div>
                                
                                <div className="d-flex flex-wrap gap-2">
                                    {t.tags.map((tag) => (
                                        <Badge key={tag.id} bg="info">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </Col>

                            <Col md={4} className="text-md-end mt-3 mt-md-0">
                                <Badge
                                    bg={
                                        t.priority === 2
                                            ? "danger"
                                            : t.priority === 1
                                                ? "warning"
                                                : "secondary"
                                    }
                                    className="mb-2"
                                >
                                    {t.priority === 2
                                        ? "High"
                                        : t.priority === 1
                                            ? "Medium"
                                            : "Low"}
                                </Badge>

                                <div className="text-muted small">
                                    Due:{" "}
                                    {t.dueDateUtc
                                        ? new Date(t.dueDateUtc).toLocaleString()
                                        : "—"}
                                </div>
                            </Col>
                        </Row>

                        <br />
                        <Row className="align-items-center">
                            <Col md={8} className="small text-muted">
                                <div>{t.userFullName}</div>
                                <div>{t.userEmail}</div>
                                <div>{t.userTelephone}</div>
                            </Col>

                            <Col md={4} className="text-md-end mt-3 mt-md-0">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => onUpdate(t)}
                                >
                                    Update
                                </Button>

                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onDelete(t.id)}
                                >
                                    Delete
                                </Button>
                            </Col>
                        </Row>
                        <hr className="my-3" />

                    </Card.Body>
                </Card>

            ))}
        </div>
    );
}

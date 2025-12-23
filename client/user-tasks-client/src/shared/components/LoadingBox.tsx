import { Spinner } from 'react-bootstrap';

export default function LoadingBox({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="d-flex align-items-center gap-2 text-muted py-3">
            <Spinner animation="border" size="sm" />
            <span>{text}</span>
        </div>
    );
}

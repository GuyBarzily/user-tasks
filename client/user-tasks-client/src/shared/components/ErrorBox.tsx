import { Alert } from 'react-bootstrap';

export default function ErrorBox({ message }: { message: string }) {
    return (
        <Alert variant="danger" className="mb-0">
            {message}
        </Alert>
    );
}

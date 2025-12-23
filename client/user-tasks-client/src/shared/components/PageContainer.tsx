import { PropsWithChildren } from 'react';
import { Container } from 'react-bootstrap';

type Props = PropsWithChildren<{
    title: string;
    subtitle?: string;
}>;

export default function PageContainer({ title, subtitle, children }: Props) {
    return (
        <Container className="py-5">
            <div className="mb-4">
                <h1 className="h3 fw-bold">{title}</h1>
                {subtitle && <div className="text-muted">{subtitle}</div>}
            </div>
            {children}
        </Container>
    );
}

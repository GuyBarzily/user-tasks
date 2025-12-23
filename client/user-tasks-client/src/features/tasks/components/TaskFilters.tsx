type Props = {
    total: number;
};

export default function TaskFilters({ total }: Props) {
    return (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted">Total tasks: {total}</div>
            {/* later: search, priority filter, tag filter */}
        </div>
    );
}

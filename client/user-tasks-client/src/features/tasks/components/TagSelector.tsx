import { useEffect, useRef, useState } from "react";
import { Badge, Form, InputGroup, ListGroup, Spinner } from "react-bootstrap";

import type { TagSuggestion } from "../tagsApi";
import { searchTags } from "../tagsApi";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

type Props = {
  label?: string;
  placeholder?: string;
  selected: TagSuggestion[];
  onChange: (next: TagSuggestion[]) => void;

  isInvalid?: boolean;
  errorText?: string;
};

export default function TagSelector({
  label = "Tags",
  placeholder = "Search tags…",
  selected,
  onChange,
  isInvalid = false,
  errorText,
}: Props) {
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tagBoxRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(tagInput, 250);

  const addTag = (tag: TagSuggestion) => {
    if (selected.some((t) => t.id === tag.id)) return;
    onChange([...selected, tag]);
    setTagInput("");
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  const removeTag = (id: number) => {
    onChange(selected.filter((t) => t.id !== id));
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

        const selectedIds = new Set(selected.map((t) => t.id));
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
  }, [debouncedQuery, selected]);

  // close dropdown when clicking outside
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

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>

      <div ref={tagBoxRef} style={{ position: "relative" }}>
        <InputGroup>
          <Form.Control
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder={placeholder}
            isInvalid={isInvalid}
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

        {errorText && (
          <Form.Control.Feedback
            type="invalid"
            style={{ display: isInvalid ? "block" : "none" }}
          >
            {errorText}
          </Form.Control.Feedback>
        )}

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

      {selected.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {selected.map((t) => (
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
  );
}

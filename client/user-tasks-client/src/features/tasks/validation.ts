// src/features/tasks/validation.ts
import type { TaskPriority } from "./types";
import type { TagSuggestion } from "./tagsApi";

export type TaskFormValues = {
  title: string;
  description: string;
  dueLocal: string; // datetime-local
  priority: TaskPriority;

  userFullName: string;
  userTelephone: string;
  userEmail: string;

  selectedTags: TagSuggestion[];
};

export type TaskFormErrors = {
  title?: string;
  description?: string;
  dueLocal?: string;
  userFullName?: string;
  userTelephone?: string;
  userEmail?: string;
  selectedTags?: string;
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^[0-9+\-\s()]{7,20}$/.test(phone);

function isValidFutureDateTimeLocal(dueLocal: string) {
  if (!dueLocal) return { ok: false, error: "Due date is required" };

  const d = new Date(dueLocal);
  if (Number.isNaN(d.getTime()))
    return { ok: false, error: "Due date is invalid" };
  if (d.getTime() <= Date.now())
    return { ok: false, error: "Due date must be in the future" };

  return { ok: true as const };
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Title is required";
  else if (title.length > 200) errors.title = "Title must be at most 200 chars";

  const desc = values.description.trim();
  if (!desc) errors.description = "Description is required";
  else if (desc.length < 5)
    errors.description = "Description must be at least 5 chars";
  else if (desc.length > 2000)
    errors.description = "Description must be at most 2000 chars";

  const dueCheck = isValidFutureDateTimeLocal(values.dueLocal);
  if (!dueCheck.ok) errors.dueLocal = dueCheck.error;

  const full = values.userFullName.trim();
  if (!full) errors.userFullName = "Full name is required";
  else if (full.length < 2) errors.userFullName = "Full name is too short";
  else if (full.length > 120) errors.userFullName = "Full name is too long";

  const phone = values.userTelephone.trim();
  if (!phone) errors.userTelephone = "Telephone is required";
  else if (!isValidPhone(phone))
    errors.userTelephone = "Telephone looks invalid";

  const email = values.userEmail.trim();
  if (!email) errors.userEmail = "Email is required";
  else if (!isValidEmail(email)) errors.userEmail = "Email looks invalid";

  if (!values.selectedTags || values.selectedTags.length === 0) {
    errors.selectedTags = "Select at least one tag";
  }

  return errors;
}

export function isValid(errors: TaskFormErrors) {
  return Object.keys(errors).length === 0;
}

/**
 * Submit-only UX helper.
 * If later you add "touched", you can extend this without changing all fields.
 */
export function shouldShowError(hasSubmitted: boolean) {
  return hasSubmitted;
}

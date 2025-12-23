import { validateTaskForm, isValid, shouldShowError } from "./validation";
import type { TaskPriority } from "./types";

type TagSuggestion = { id: number; name: string };

const baseValidValues = () => ({
  title: "Interview assignment",
  description: "Build tasks app UI and API",
  dueLocal: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), // "YYYY-MM-DDTHH:mm"
  priority: 1 as TaskPriority,
  userFullName: "Guy Barzily",
  userTelephone: "+972-50-1234567",
  userEmail: "guy@example.com",
  selectedTags: [{ id: 1, name: "backend" }] as TagSuggestion[],
});

describe("tasks/validation", () => {
  test("shouldShowError: false before submit, true after submit", () => {
    expect(shouldShowError(false)).toBe(false);
    expect(shouldShowError(true)).toBe(true);
  });

  test("isValid: true when all fields are valid", () => {
    const values = baseValidValues();
    const errors = validateTaskForm(values);

    expect(isValid(errors)).toBe(true);
  });

  test("title required", () => {
    const values = baseValidValues();
    values.title = "   ";

    const errors = validateTaskForm(values);
    expect(errors.title).toBeTruthy();
    expect(isValid(errors)).toBe(false);
  });

  test("title max length", () => {
    const values = baseValidValues();
    values.title = "a".repeat(201);

    const errors = validateTaskForm(values);
    expect(errors.title).toBeTruthy();
  });

  test("description required", () => {
    const values = baseValidValues();
    values.description = "";

    const errors = validateTaskForm(values);
    expect(errors.description).toBeTruthy();
  });

  test("due date required", () => {
    const values = baseValidValues();
    values.dueLocal = "";

    const errors = validateTaskForm(values);
    expect(errors.dueLocal).toBeTruthy();
  });

  test("due date must be in the future", () => {
    const values = baseValidValues();
    const past = new Date(Date.now() - 60 * 1000);
    values.dueLocal = past.toISOString().slice(0, 16);

    const errors = validateTaskForm(values);
    expect(errors.dueLocal).toBeTruthy();
  });

  test("full name required", () => {
    const values = baseValidValues();
    values.userFullName = " ";

    const errors = validateTaskForm(values);
    expect(errors.userFullName).toBeTruthy();
  });

  test("telephone required + format", () => {
    const values = baseValidValues();
    values.userTelephone = "";

    let errors = validateTaskForm(values);
    expect(errors.userTelephone).toBeTruthy();

    values.userTelephone = "abc";
    errors = validateTaskForm(values);
    expect(errors.userTelephone).toBeTruthy();
  });

  test("email required + format", () => {
    const values = baseValidValues();
    values.userEmail = "";

    let errors = validateTaskForm(values);
    expect(errors.userEmail).toBeTruthy();

    values.userEmail = "not-an-email";
    errors = validateTaskForm(values);
    expect(errors.userEmail).toBeTruthy();
  });

  test("must select at least one tag", () => {
    const values = baseValidValues();
    values.selectedTags = [];

    const errors = validateTaskForm(values);
    expect(errors.selectedTags).toBeTruthy();
  });
});

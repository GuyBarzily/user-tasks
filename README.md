# User Tasks – Full Stack Assignment

This project is a full-stack task management application built as a technical assignment.

It demonstrates how I approach:

- Feature design from requirements
- Client–server separation
- State management and validation on the frontend
- A realistic relational data model on the backend

The application allows users to create and manage tasks with metadata such as priority, due date, user details, and tags.

---

## Tech Stack

### Client

- React
- TypeScript
- Redux Toolkit
- React-Redux
- Bootstrap / React-Bootstrap
- Jest (unit testing)

### Server

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Docker

---

## Core Features

- Create tasks with:
  - Title
  - Description
  - Due date
  - Priority
  - User details (full name, telephone, email)
  - Tags (many-to-many relationship)
- Client-side form validation with clear error messages
- Debounced tag search
- Centralized state management using Redux Toolkit
- Clean separation between UI, business logic, and data access
- Unit tests for validation logic

---

## Project Structure

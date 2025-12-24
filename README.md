# User Tasks – Setup & Run Guide

This project is a small full-stack system for managing user tasks with reminder handling.

It includes:
- **Client** – React application
- **Server (API)** – .NET Web API
- **Worker** – .NET Background Service
- **Infrastructure** – SQL Server + RabbitMQ (Docker)

---

## 1) Requirements

- Docker Desktop
- .NET SDK 8+
- Node.js 18+
- Terminal (macOS / Linux / Windows)

---

## 2) Start Docker

From the project root, run:

```bash
docker compose up -d
```

| Service    | Port(s)     | Purpose                   |
| ---------- | ----------- | ------------------------- |
| SQL Server | 1433        | Main database             |
| RabbitMQ   | 5672, 15672 | Messaging + management UI |

Verify containers are running:
```
docker ps
```

RabbitMQ Management UI:
```
http://localhost:15672
username: guest
password: guest
```

## 3) Start the Server (API)

Open a new terminal:
```
cd server/UserTasks.Api
dotnet restore
dotnet ef database update
dotnet run
```
The API will be available at:
```
http://localhost:5296
```

## 4) Start the Worker
Open another terminal:
```
cd server/UserTasks.Worker
dotnet restore
dotnet run
```

Expected logs:

Worker started

RabbitMQ connected

Periodic polling for overdue tasks

Reminder logs when tasks are due
Example:
```
Hi your Task is due 1 (Interview reminder test)
```

## 5) Start the Client
Open another terminal:
```
cd client
npm install
npm start
```

## Notes

- Database schema is created via EF Core migrations

- Worker uses polling + idempotency (ReminderSentUtc)

- RabbitMQ handles concurrent reminder processing safely

- All services can be started independently

namespace UserTasks.Worker.Messaging;

public record ReminderMessage(int TaskId, string Title, DateTime DueDateUtc);

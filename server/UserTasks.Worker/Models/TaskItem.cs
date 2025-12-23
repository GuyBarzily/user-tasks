namespace UserTasks.Worker.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";

    public DateTime? DueDateUtc { get; set; }

    public DateTime? ReminderSentUtc { get; set; }
}

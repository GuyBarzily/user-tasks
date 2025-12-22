using System.ComponentModel.DataAnnotations;

namespace UserTasks.Api.Models;

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

public class TaskItem
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public DateTime? DueDateUtc { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    // User Details (stored on the task for simplicity)
    [MaxLength(200)]
    public string UserFullName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string UserTelephone { get; set; } = string.Empty;

    [MaxLength(320)]
    public string UserEmail { get; set; } = string.Empty;

    // Audit
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Tags (many-to-many)
    public List<Tag> Tags { get; set; } = new();
}

using System.ComponentModel.DataAnnotations;

namespace UserTasks.Api.Models;

public class Tag
{
    public int Id { get; set; }

    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public List<TaskItem> Tasks { get; set; } = new();
}

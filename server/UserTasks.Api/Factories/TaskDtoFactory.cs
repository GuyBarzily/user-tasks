using UserTasks.Api.Dtos;
using UserTasks.Api.Models;

namespace UserTasks.Api.Factories;

public static class TaskDtoFactory
{
    public static TaskDto ToDto(TaskItem task)
        => new TaskDto(
            Id: task.Id,
            Title: task.Title,
            Description: task.Description,
            DueDateUtc: task.DueDateUtc,
            Priority: task.Priority,
            UserFullName: task.UserFullName,
            UserTelephone: task.UserTelephone,
            UserEmail: task.UserEmail,
            Tags: task.Tags.Select(t => t.Name).OrderBy(n => n).ToList(),
            CreatedAtUtc: task.CreatedAtUtc
        );
}

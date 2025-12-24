using UserTasks.Api.Dtos;
using UserTasks.Api.Models;

namespace UserTasks.Api.Factories;

public static class TaskDtoFactory
{
    public static TaskDto ToDto(TaskItem task)
        => new(
            task.Id,
            task.Title,
            task.Description,
            task.DueDateUtc,
            task.Priority,
            task.UserFullName,
            task.UserTelephone,
            task.UserEmail,
            task.Tags.Select(t => new TagDto(t.Id, t.Name)).ToList(),
            task.CreatedAtUtc
        );
}

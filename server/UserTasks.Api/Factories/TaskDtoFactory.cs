using UserTasks.Api.Dtos;
using UserTasks.Api.Models;

namespace UserTasks.Api.Factories;

public static class TaskDtoFactory
{
    public static TaskDto ToDto(TaskItem t) =>
        new(
            t.Id,
            t.Title,
            t.Description,
            t.DueDateUtc,
            t.Priority,
            t.UserFullName,
            t.UserTelephone,
            t.UserEmail,
            t.Tags.Select(x => x.Id).ToList(),
            t.Tags.Select(x => x.Name).ToList(),
            t.CreatedAtUtc
        );
}

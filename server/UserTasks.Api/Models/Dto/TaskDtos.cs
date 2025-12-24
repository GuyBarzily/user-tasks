using UserTasks.Api.Models;

namespace UserTasks.Api.Dtos;

public record TaskDto(
    int Id,
    string Title,
    string Description,
    DateTime? DueDateUtc,
    TaskPriority Priority,
    string UserFullName,
    string UserTelephone,
    string UserEmail,
    List<TagDto> Tags,         
    DateTime CreatedAtUtc
);

public record CreateTaskRequest(
    string Title,
    string? Description,
    DateTime? DueDateUtc,
    TaskPriority Priority,
    string UserFullName,
    string UserTelephone,
    string UserEmail,
    List<int>? TagIds         
);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    DateTime? DueDateUtc,
    TaskPriority Priority,
    string UserFullName,
    string UserTelephone,
    string UserEmail,
    List<int>? TagIds            
);

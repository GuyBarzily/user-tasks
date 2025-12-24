namespace UserTasks.Api.Dtos;

public record TagDto(int Id, string Name);

public record CreateTagRequest(string Name);
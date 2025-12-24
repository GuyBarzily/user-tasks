using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using UserTasks.Api.Dtos;
using Xunit;
using System.Threading.Tasks;
using UserTasks.Api.Models;


namespace UserTasks.Api.Tests.Tasks;

public class TasksValidationTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TasksValidationTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateTask_ReturnsBadRequest_WhenTitleMissing()
    {
        var req = new CreateTaskRequest(
            Title: "",
            Description: "test",
            DueDateUtc: DateTime.UtcNow,
            Priority: TaskPriority.Low,
            UserFullName: "Guy",
            UserTelephone: "050",
            UserEmail: "guy@test.com",
            TagIds: []
        );

        var res = await _client.PostAsJsonAsync("/api/tasks", req);

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }
}

using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using UserTasks.Api.Dtos;
using Xunit;
using System.Threading.Tasks;


namespace UserTasks.Api.Tests.Tasks;

public class TasksControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TasksControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoTasks()
    {
        var res = await _client.GetAsync("/api/tasks");

        res.EnsureSuccessStatusCode();

        var tasks = await res.Content.ReadFromJsonAsync<List<TaskDto>>();
        Assert.NotNull(tasks);
        Assert.Empty(tasks!);
    }
}

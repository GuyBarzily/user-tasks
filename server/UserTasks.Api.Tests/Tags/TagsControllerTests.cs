using System.Net.Http;
using System.Net.Http.Json;
using UserTasks.Api.Dtos;
using System.Threading.Tasks;
using Xunit;

namespace UserTasks.Api.Tests.Tags;

public class TagsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TagsControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateTag_ReturnsCreatedTag()
    {
        var res = await _client.PostAsJsonAsync("/api/tags", new { name = "testing" });

        res.EnsureSuccessStatusCode();

        var tag = await res.Content.ReadFromJsonAsync<TagDto>();
        Assert.NotNull(tag);
        Assert.Equal("testing", tag!.Name);
    }
}

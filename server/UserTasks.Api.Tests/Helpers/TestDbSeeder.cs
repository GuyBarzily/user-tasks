using UserTasks.Api.Data;
using UserTasks.Api.Models;

namespace UserTasks.Api.Tests.Helpers;

public static class TestDbSeeder
{
    public static void SeedTags(AppDbContext db)
    {
        db.Tags.AddRange(
            new Tag { Name = "backend" },
            new Tag { Name = "frontend" },
            new Tag { Name = "redux" }
        );
        db.SaveChanges();
    }
}

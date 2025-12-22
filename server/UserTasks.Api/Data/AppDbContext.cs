using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Models;

namespace UserTasks.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Many-to-many join table will be auto-created by EF Core
        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Tags)
            .WithMany(t => t.Tasks);

        base.OnModelCreating(modelBuilder);
    }
}

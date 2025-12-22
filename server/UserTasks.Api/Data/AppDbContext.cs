using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Models;

namespace UserTasks.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
        });
    }
}

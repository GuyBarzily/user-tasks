using Microsoft.EntityFrameworkCore;
using UserTasks.Worker.Models;

namespace UserTasks.Worker.Data;

public class WorkerDbContext : DbContext
{
    public WorkerDbContext(DbContextOptions<WorkerDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(b =>
        {
            b.ToTable("Tasks");
            b.HasKey(x => x.Id);

            b.Property(x => x.Title).HasMaxLength(200);
            b.Property(x => x.DueDateUtc);
            b.Property(x => x.ReminderSentUtc);

            b.HasIndex(x => new { x.ReminderSentUtc, x.DueDateUtc });
        });
    }
}

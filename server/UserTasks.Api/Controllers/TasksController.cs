using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;
using UserTasks.Api.Dtos;
using UserTasks.Api.Factories;
using UserTasks.Api.Models;

namespace UserTasks.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll()
    {
        var tasks = await _db.Tasks
            .Include(t => t.Tags)
            .OrderBy(t => t.Id)
            .ToListAsync();

        return Ok(tasks.Select(TaskDtoFactory.ToDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.Id == id);

        return task is null ? NotFound() : Ok(TaskDtoFactory.ToDto(task));
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskRequest req)
    {
        var validation = Validate(req.Title, req.UserFullName, req.UserTelephone, req.UserEmail);
        if (validation is not null) return validation;

        var tags = await GetOrCreateTagsAsync(req.Tags);

        var task = new TaskItem
        {
            Title = req.Title.Trim(),
            Description = (req.Description ?? string.Empty).Trim(),
            DueDateUtc = req.DueDateUtc,
            Priority = req.Priority,
            UserFullName = req.UserFullName.Trim(),
            UserTelephone = req.UserTelephone.Trim(),
            UserEmail = req.UserEmail.Trim(),
            Tags = tags
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // reload tags for response
        var created = await _db.Tasks
            .Include(t => t.Tags)
            .FirstAsync(t => t.Id == task.Id);

        var dto = TaskDtoFactory.ToDto(created);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, [FromBody] UpdateTaskRequest req)
    {
        var validation = Validate(req.Title, req.UserFullName, req.UserTelephone, req.UserEmail);
        if (validation is not null) return validation;

        var task = await _db.Tasks
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null) return NotFound();

        task.Title = req.Title.Trim();
        task.Description = (req.Description ?? string.Empty).Trim();
        task.DueDateUtc = req.DueDateUtc;
        task.Priority = req.Priority;
        task.UserFullName = req.UserFullName.Trim();
        task.UserTelephone = req.UserTelephone.Trim();
        task.UserEmail = req.UserEmail.Trim();

        // replace tags
        task.Tags.Clear();
        var tags = await GetOrCreateTagsAsync(req.Tags);
        foreach (var tag in tags)
            task.Tags.Add(tag);

        await _db.SaveChangesAsync();

        return Ok(TaskDtoFactory.ToDto(task));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- helpers ----------

    private ActionResult? Validate(string title, string fullName, string phone, string email)
    {
        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { error = "Title is required" });

        if (string.IsNullOrWhiteSpace(fullName))
            return BadRequest(new { error = "User full name is required" });

        if (string.IsNullOrWhiteSpace(phone))
            return BadRequest(new { error = "User telephone is required" });

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { error = "User email is required" });

        if (!email.Contains("@"))
            return BadRequest(new { error = "User email is invalid" });

        return null;
    }

    private async Task<List<Tag>> GetOrCreateTagsAsync(List<string>? tagNames)
    {
        if (tagNames is null || tagNames.Count == 0)
            return new List<Tag>();

        var cleaned = tagNames
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .Where(t => t.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (cleaned.Count == 0)
            return new List<Tag>();

        // Case-insensitive match (avoid duplicates)
        var existing = await _db.Tags
            .Where(t => cleaned.Contains(t.Name))
            .ToListAsync();

        var existingNames = existing.Select(t => t.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = cleaned
            .Where(name => !existingNames.Contains(name))
            .Select(name => new Tag { Name = name })
            .ToList();

        if (missing.Count > 0)
        {
            _db.Tags.AddRange(missing);
            await _db.SaveChangesAsync();
            existing.AddRange(missing);
        }

        return existing;
    }
}

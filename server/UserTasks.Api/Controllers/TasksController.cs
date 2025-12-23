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

        List<Tag> tags;
        try
        {
            tags = await GetTagsByIdsAsync(req.TagIds);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }

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

        var created = await _db.Tasks
            .Include(t => t.Tags)
            .FirstAsync(t => t.Id == task.Id);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, TaskDtoFactory.ToDto(created));
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

        List<Tag> tags;
        try
        {
            tags = await GetTagsByIdsAsync(req.TagIds);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }

        task.Title = req.Title.Trim();
        task.Description = (req.Description ?? string.Empty).Trim();
        task.DueDateUtc = req.DueDateUtc;
        task.Priority = req.Priority;
        task.UserFullName = req.UserFullName.Trim();
        task.UserTelephone = req.UserTelephone.Trim();
        task.UserEmail = req.UserEmail.Trim();

        task.Tags.Clear();
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

    private async Task<List<Tag>> GetTagsByIdsAsync(List<int>? tagIds)
    {
        if (tagIds is null || tagIds.Count == 0)
            return new List<Tag>();

        var cleaned = tagIds
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (cleaned.Count == 0)
            return new List<Tag>();

        var tags = await _db.Tags
            .Where(t => cleaned.Contains(t.Id))
            .ToListAsync();

        // Validate all exist
        if (tags.Count != cleaned.Count)
        {
            var found = tags.Select(t => t.Id).ToHashSet();
            var missing = cleaned.Where(id => !found.Contains(id)).ToList();
            throw new InvalidOperationException($"Unknown tag id(s): {string.Join(", ", missing)}");
        }

        return tags;
    }
}

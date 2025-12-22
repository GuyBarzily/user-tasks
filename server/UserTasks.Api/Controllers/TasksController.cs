using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;
using UserTasks.Api.Models;

namespace UserTasks.Api.Controllers;

public record CreateTaskRequest(string Title);
public record UpdateTaskRequest(string Title, bool IsDone);

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
    public async Task<ActionResult<List<TaskItem>>> GetAll()
    {
        return Ok(await _db.Tasks.OrderBy(t => t.Id).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetById(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(CreateTaskRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { error = "Title is required" });

        var task = new TaskItem
        {
            Title = req.Title.Trim(),
            IsDone = false
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskItem>> Update(int id, UpdateTaskRequest req)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        task.Title = req.Title.Trim();
        task.IsDone = req.IsDone;

        await _db.SaveChangesAsync();
        return Ok(task);
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
}

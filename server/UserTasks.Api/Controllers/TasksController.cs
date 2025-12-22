using Microsoft.AspNetCore.Mvc;

namespace UserTasks.Api.Controllers;

public record TaskItem(int Id, string Title, bool IsDone);

public record CreateTaskRequest(string Title);
public record UpdateTaskRequest(string Title, bool IsDone);

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    // In-memory store (resets when server restarts)
    private static readonly List<TaskItem> _tasks = new()
    {
        new TaskItem(1, "First task", false),
        new TaskItem(2, "Second task", true),
    };

    private static int _nextId = 3;

    [HttpGet]
    public ActionResult<List<TaskItem>> GetAll() => Ok(_tasks);

    [HttpGet("{id:int}")]
    public ActionResult<TaskItem> GetById(int id)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public ActionResult<TaskItem> Create([FromBody] CreateTaskRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { error = "Title is required" });

        var task = new TaskItem(_nextId++, req.Title.Trim(), false);
        _tasks.Add(task);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public ActionResult<TaskItem> Update(int id, [FromBody] UpdateTaskRequest req)
    {
        var index = _tasks.FindIndex(t => t.Id == id);
        if (index == -1) return NotFound();

        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { error = "Title is required" });

        var updated = new TaskItem(id, req.Title.Trim(), req.IsDone);
        _tasks[index] = updated;

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var removed = _tasks.RemoveAll(t => t.Id == id);
        return removed == 0 ? NotFound() : NoContent();
    }
}

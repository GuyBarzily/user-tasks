using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;
using UserTasks.Api.Dtos;
using UserTasks.Api.Models;

namespace UserTasks.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TagsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/tags?query=do
    // returns: [{ id, name }, ...]
    [HttpGet]
    public async Task<ActionResult<List<TagDto>>> Get([FromQuery] string? query)
    {
        var q = (query ?? string.Empty).Trim();

        var tagsQuery = _db.Tags.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var lower = q.ToLower();
            tagsQuery = tagsQuery.Where(t => t.Name.ToLower().Contains(lower));
        }

        var tags = await tagsQuery
            .OrderBy(t => t.Name)
            .Take(20)
            .Select(t => new TagDto(t.Id, t.Name))
            .ToListAsync();

        return Ok(tags);
    }

    // POST /api/tags
    // body: { "name": "docker" }
    [HttpPost]
    public async Task<ActionResult<TagDto>> Create([FromBody] CreateTagRequest req)
    {
        var name = (req.Name ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { error = "Name is required" });

        if (name.Length > 50) // adjust if your Tag model uses different max length
            return BadRequest(new { error = "Name is too long" });

        // Case-insensitive uniqueness (avoid duplicates)
        var exists = await _db.Tags.AnyAsync(t => t.Name.ToLower() == name.ToLower());
        if (exists)
            return Conflict(new { error = "Tag already exists" });

        var tag = new Tag { Name = name };
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { query = tag.Name }, new TagDto(tag.Id, tag.Name));
    }
}

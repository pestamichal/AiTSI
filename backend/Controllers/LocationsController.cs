using backend.Controllers.Abstract;
using backend.DatabaseContext;
using backend.Logic;
using backend.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Controllers;

public class RegionNode
{
    public string Name { get; set; } = null!;
    public int Id { get; set; }
    public int? Parent { get; set; }
    public List<RegionNode>? Subregions { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class LocationsController : BaseController
{
    private static string? _cachedJson;
    private static readonly object BuildLock = new();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    public LocationsController(
        ILogger<LocationsController> logger,
        DatabaseManager databaseManager,
        ApiHelper apiHelper,
        JwtHelper jwtHelper,
        StorageManager storageManager) : base(logger, databaseManager, apiHelper, jwtHelper, storageManager)
    {
    }

    [HttpGet("all")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        if (_cachedJson != null)
            return Content(_cachedJson, "application/json; charset=utf-8");

        try
        {
            var json = await BuildTerritorialTree();
            return Content(json, "application/json; charset=utf-8");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build territorial tree from database");
            return Problem(
                detail: "Could not load territorial data.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private async Task<string> BuildTerritorialTree()
    {
        var countries = await _databaseManager.GetTerritorialTreeAsync();

        var roots = countries.Select(c => new RegionNode
        {
            Name = c.Name,
            Id = c.Id,
            Parent = null,
            Subregions = c.Voivodeships
                .OrderBy(v => v.Name)
                .Select(v => new RegionNode
                {
                    Name = v.Name,
                    Id = v.Id,
                    Parent = c.Id,
                    Subregions = v.Counties
                        .OrderBy(co => co.Name)
                        .Select(co => new RegionNode
                        {
                            Name = co.Name,
                            Id = co.Id,
                            Parent = v.Id,
                            Subregions = co.Cities
                                .OrderBy(ci => ci.Name)
                                .Select(ci => new RegionNode
                                {
                                    Name = ci.Name,
                                    Id = ci.Id,
                                    Parent = co.Id,
                                    Subregions = null,
                                }).ToList(),
                        }).ToList(),
                }).ToList(),
        }).ToList();

        var wrapper = new { Data = roots };
        var json = JsonSerializer.Serialize(wrapper, JsonOptions);

        lock (BuildLock)
        {
            _cachedJson ??= json;
        }

        return _cachedJson;
    }
}

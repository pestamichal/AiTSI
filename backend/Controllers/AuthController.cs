using System.Collections.Generic;
using backend.Authorization;
using backend.Controllers.Abstract;
using backend.DatabaseContext;
using backend.DatabaseContext.DatabaseModels;
using backend.DatabaseContext.Dtos;
using backend.Logic;
using backend.Models;
using backend.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : BaseController
{

    public AuthController(
        ILogger<PhotosController> logger,
        DatabaseManager databaseManager,
        ApiHelper apiHelper,
        JwtHelper jwtHelper,
        StorageManager storageManager) : base(logger, databaseManager, apiHelper, jwtHelper, storageManager){

        }
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var email = _jwtHelper.GetEmail(User);
        if(string.IsNullOrEmpty(email)){
            _logger.LogWarning("Authenticated request missing email claim");
            return Unauthorized();
        }
        bool isUserBlocked = await _databaseManager.IsUserBlocked(email);
        bool isUserAdmin = await _databaseManager.IsAdmin(email);

        UserInfoModel resp = new UserInfoModel(){
        email = email,
        isBlocked = isUserBlocked,
        isAdmin = isUserAdmin
        };
        return Ok(resp);
    }

    [Authorize]
    [HttpPost("block")]
    public async Task<IActionResult> BlockUser([FromBody] BlockUserModel data)
    {
        _logger.LogInformation("BlockUser Controller processed a request.");
        var email = _jwtHelper.GetEmail(User);
        if(string.IsNullOrEmpty(email)){
            _logger.LogWarning("Authenticated request missing email claim");
            return Unauthorized();
        }

        bool isUserAdmin = await _databaseManager.IsAdmin(email);
        if(!isUserAdmin){
            _logger.LogWarning($"User {email} is not authorized to perform this action!");
            return Unauthorized();
        }

        var IsUserToBlockAdmin = await _databaseManager.IsAdmin(data.email);
        if(IsUserToBlockAdmin){
            _logger.LogWarning($"User {email} is not allowed to block {data.email}. Can't block an admin.");
            return BadRequest();
        }

        bool dbResponse = await _databaseManager.BlockUserAsync(data.email);
        return Ok(dbResponse);
    }
}

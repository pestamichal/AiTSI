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
[Route("api/photos")]
public class PhotosController : BaseController
{
    public PhotosController(
        ILogger<PhotosController> logger,
        DatabaseManager databaseManager,
        ApiHelper apiHelper,
        JwtHelper jwtHelper,
        StorageManager storageManager) : base(logger, databaseManager, apiHelper, jwtHelper, storageManager)
    {

    }

    [HttpGet(Name = "GetPhotos")]
    [Route("get")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPhotos()
    {
        _logger.LogInformation("Processing GetPhotos request");
        var photos = await _databaseManager.SearchPhotos();
        List<PhotoResponseModel> result = [];
        photos.ForEach(p => {
            _logger.LogInformation($"Photos: {p}");
            PhotoResponseModel photoData = new PhotoResponseModel(){
                Id = p.Id,
                Author = p.Author,
                Title = p.Title,
                Description = p.Description,
                CountryId = p.CountryId,
                VoivodeshipId = p.VoivodeshipId,
                CountyId = p.CountyId,
                CityId = p.CityId,
                YearTaken = p.YearTaken,
                MonthTaken = p.MonthTaken,
                DayTaken = p.DayTaken,
            };
            result.Add(photoData);
        });
        return Ok(result);
    }

    [HttpGet(Name = "GetPhotoFile")]
    [Route("file/{photoId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPhotoFile(Guid photoId)
    {
        var photo = await _databaseManager.GetPhotoAsync(photoId);
        if (photo == null)
        {
            _logger.LogWarning("Photo with id {PhotoId} not found", photoId);
            return NotFound();
        }

        var storageResult = await _storageManager.GetBlobAsync(photo.PhotoUrl);
        var blobData = storageResult.Blob?.Data;
        if (!storageResult.IsSuccess || blobData == null || blobData.Length == 0)
        {
            _logger.LogWarning(
                "Storage read failed for photo {PhotoId} key {StorageKey}: {Error}",
                photoId,
                photo.PhotoUrl,
                storageResult.Error);
            return NotFound();
        }

        var ext = NormalizeStoredExtension(photo.FileExtension);
        var contentType = ContentTypeForExtension(ext);
        return File(blobData, contentType);
    }


    [HttpPost(Name = "CreatePhoto")]
    [Route("create")]
    [Authorize(Policy = AuthPolicies.NotBlocked)]
    public async Task<IActionResult> CreatePhoto([FromBody] CreatePhotoModel model)
    {
        var email = _jwtHelper.GetEmail(User);
        var googleSubject = _jwtHelper.GetGoogleSubject(User);

        if (string.IsNullOrEmpty(email))
        {
            _logger.LogWarning("Authenticated request missing email claim");
            return Unauthorized();
        }

        if (model.PhotoData == null || model.PhotoData.Length == 0)
            return BadRequest("PhotoData is required and must not be empty.");

        var normalizedExt = TryNormalizeUploadedExtension(model.FileExtension);
        if (normalizedExt == null)
            return BadRequest("FileExtension is required and must be a supported image type (jpg, png, gif, webp, bmp, svg).");

        var photoId = Guid.NewGuid();
        var storageKey = $"photos/{googleSubject}/{photoId}";

        var upload = await _storageManager.CreateBlobAsync(
            storageKey,
            model.PhotoData,
            new Dictionary<string, string>());

        if (!upload.IsSuccess)
            return Problem(detail: upload.Error, statusCode: StatusCodes.Status502BadGateway);

        var dto = new CreatePhotoDto
        {
            Id = photoId,
            Title = model.Title ?? string.Empty,
            Description = model.Description ?? string.Empty,
            PhotoUrl = storageKey,
            FileExtension = normalizedExt,
            Author = email,
            CountryId = model.CountryId,
            VoivodeshipId = model.VoivodeshipId,
            CountyId = model.CountyId,
            CityId = model.CityId,
            YearTaken = model.YearTaken,
            MonthTaken = model.MonthTaken,
            DayTaken = model.DayTaken
        };

        var photo = await _databaseManager.CreatePhoto(dto);
        return Ok(photo);
    }

    [HttpDelete(Name = "DeletePhoto")]
    [Route("delete/{photoId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeletePhoto(Guid photoId){

        _logger.LogInformation($"DeletePhoto controller processed a request.");
        var email = _jwtHelper.GetEmail(User);

        if(string.IsNullOrEmpty(email)){
            _logger.LogWarning("Authenticated request missing email claim");
            return Unauthorized();
        }

        var photo = await _databaseManager.GetPhotoAsync(photoId);
        if (photo == null)
        {
            _logger.LogWarning($"Photo with id {photoId} not found");
            return NotFound();
        }

        bool isAdmin = await _databaseManager.IsAdmin(email);

        if(photo.Author != email && !isAdmin){
            _logger.LogWarning($"User {email} does not have permissions to delete this item: {photoId}");
            return Unauthorized();
        };

        var storageResponse = await _storageManager.DeleteBlobAsync(photo.PhotoUrl);
        var deletedFromStorage = storageResponse.IsSuccess;
        if(!deletedFromStorage){
            _logger.LogWarning($"Failed to delete file: {photo.PhotoUrl} from storage.");
        }

        bool dbResponse = await _databaseManager.DeletePhotoAsync(photoId);
        return Ok(dbResponse);
    }

    
    private static readonly HashSet<string> AllowedImageExtensions =
    [
        "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
    ];

    private static string? TryNormalizeUploadedExtension(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;
        var s = raw.Trim().TrimStart('.').ToLowerInvariant();
        if (s.Length == 0 || s.Length > 10)
            return null;
        if (s == "jpeg")
            s = "jpg";
        return AllowedImageExtensions.Contains(s) ? s : null;
    }

    private static string NormalizeStoredExtension(string? stored)
    {
        if (string.IsNullOrWhiteSpace(stored))
            return "jpg";
        var s = stored.Trim().TrimStart('.').ToLowerInvariant();
        if (s == "jpeg")
            s = "jpg";
        return AllowedImageExtensions.Contains(s) ? s : "jpg";
    }

    private static string ContentTypeForExtension(string ext) => ext switch
    {
        "jpg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "svg" => "image/svg+xml",
        _ => "image/jpeg"
    };
}

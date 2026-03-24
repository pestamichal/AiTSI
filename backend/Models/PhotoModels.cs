namespace backend.Models;

public class CreatePhotoModel
{

    public string? Title { get; set; }

    public string? Description { get; set; }

    public int CountryId { get; set; }

    public int? VoivodeshipId { get; set; }

    public int? CountyId { get; set; }

    public int? CityId { get; set; }

    public int YearTaken { get; set; }
    public int? MonthTaken { get; set; }
    public int? DayTaken { get; set; }

    /// <summary>Image (or file) bytes. In JSON, send as a Base64-encoded string.</summary>
    public byte[] PhotoData { get; set; } = [];

    /// <summary>File extension without dot (e.g. jpg, png). Used when serving the image.</summary>
    public string? FileExtension { get; set; }
}

public class PhotoResponseModel
{
    public Guid Id { get; set; }
    public string Author { get; set; }
    public string? Title { get; set; }

    public string? Description { get; set; }

    public int CountryId { get; set; }

    public int? VoivodeshipId { get; set; }

    public int? CountyId { get; set; }

    public int? CityId { get; set; }

    public int YearTaken { get; set; }
    public int? MonthTaken { get; set; }
    public int? DayTaken { get; set; }
    public string? PhotoUrl { get; set; }
    public string? FileExtension { get; set; }
}

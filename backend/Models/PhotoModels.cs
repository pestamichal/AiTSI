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
    public byte[] PhotoData { get; set; } = [];
    public string? FileExtension { get; set; }
}

public class EditPhotoModel
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int CountryId { get; set; }
    public int? VoivodeshipId { get; set; }
    public int? CountyId { get; set; }
    public int? CityId { get; set; }
    public int YearTaken { get; set; }
    public int? MonthTaken { get; set; }
    public int? DayTaken { get; set; }
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

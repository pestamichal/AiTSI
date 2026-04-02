namespace backend.DatabaseContext.Dtos
{
    public class SearchPhotosCriteria
    {
        public string? Keywords { get; set; }
        public int? YearFrom { get; set; }
        public int? MonthFrom { get; set; }
        public int? DayFrom { get; set; }
        public int? YearTo { get; set; }
        public int? MonthTo { get; set; }
        public int? DayTo { get; set; }
        public bool SortOldestFirst { get; set; }
        public int? CountryId { get; set; }
        public int? VoivodeshipId { get; set; }
        public int? CountyId { get; set; }
        public int? CityId { get; set; }
        public string? Author { get; set; }
    }

    public class CreatePhotoDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string PhotoUrl { get; set; }
        public string FileExtension { get; set; } = "jpg";
        public string Author { get; set; }
        public int CountryId { get; set; }
        public int? VoivodeshipId { get; set; }
        public int? CountyId { get; set; }
        public int? CityId { get; set; }
        public int YearTaken { get; set; }
        public int? MonthTaken { get; set; }
        public int? DayTaken { get; set; }
    }

    public class EditPhotoDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CountryId { get; set; }
        public int? VoivodeshipId { get; set; }
        public int? CountyId { get; set; }
        public int? CityId { get; set; }
        public int YearTaken { get; set; }
        public int? MonthTaken { get; set; }
        public int? DayTaken { get; set; }
    }
}

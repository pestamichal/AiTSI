using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("photos")]
public class Photo
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("title")]
    public string? Title { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("photo_url")]
    [Required]
    public string PhotoUrl { get; set; } = null!;

    [Column("file_extension")]
    [Required]
    public string FileExtension { get; set; } = "jpg";

    [Column("author")]
    public string Author { get; set; }

    [Column("year_taken")]
    public int YearTaken { get; set; }
    
    [Column("month_taken")]
    public int? MonthTaken { get; set; }

    [Column("day_taken")]
    public int? DayTaken { get; set; }


    [Column("country_id")]
    public int CountryId { get; set; }

    [Column("voivodeship_id")]
    public int? VoivodeshipId { get; set; }

    [Column("county_id")]
    public int? CountyId { get; set; }

    [Column("city_id")]
    public int? CityId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }


    [ForeignKey(nameof(CountryId))]
    public Country Country { get; set; } = null!;

    [ForeignKey(nameof(VoivodeshipId))]
    public Voivodeship Voivodeship { get; set; } = null!;

    [ForeignKey(nameof(CountyId))]
    public County County { get; set; } = null!;

    [ForeignKey(nameof(CityId))]
    public City City { get; set; } = null!;
}

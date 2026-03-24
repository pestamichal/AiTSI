using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("voivodeships")]
public class Voivodeship
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("country_id")]
    public int CountryId { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = null!;

    [ForeignKey(nameof(CountryId))]
    public Country Country { get; set; } = null!;

    public ICollection<County> Counties { get; set; } = new List<County>();
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("counties")]
public class County
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("voivodeship_id")]
    public int VoivodeshipId { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = null!;

    [ForeignKey(nameof(VoivodeshipId))]
    public Voivodeship Voivodeship { get; set; } = null!;

    public ICollection<City> Cities { get; set; } = new List<City>();
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}

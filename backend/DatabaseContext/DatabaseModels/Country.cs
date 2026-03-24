using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("countries")]
public class Country
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = null!;

    public ICollection<Voivodeship> Voivodeships { get; set; } = new List<Voivodeship>();
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}

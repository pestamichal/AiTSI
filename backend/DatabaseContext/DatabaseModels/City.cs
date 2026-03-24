using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("cities")]
public class City
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("county_id")]
    public int CountyId { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = null!;


    [ForeignKey(nameof(CountyId))]
    public County County { get; set; } = null!;

    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}

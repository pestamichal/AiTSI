using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("admins")]
public class Admins{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DatabaseContext.DatabaseModels;

[Table("blocked_users")]
public class BlockedUsers{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;
}
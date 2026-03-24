namespace backend.DatabaseContext.Dtos
{
    public class CreateUserDto
    {
        public Guid? Id { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsBlocked { get; set; }

    }

}

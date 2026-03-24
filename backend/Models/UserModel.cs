namespace backend.Models;

public class UserInfoModel{
    public string email { get; set; }
    public bool isAdmin { get; set; }
    public bool isBlocked { get; set; }
}

public class BlockUserModel{
    public string email {get; set;}
}
namespace Transit.Domain;

public class UserRole : BaseEntity
{
    public long? UserId { get; set; }
    public long? RoleId { get; set; }
    public virtual User User { get; set; }
    public virtual Role Role { get; set; }


}

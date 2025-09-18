namespace Transit.Domain.Models;

public class RolePrivilege : BaseEntity
{
    public long RoleId { get; set; }
    public long PrivilegeId { get; set; }
    public virtual Privilege Privilege { get; set; }
    public virtual Role Role { get; set; }


}

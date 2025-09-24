using Microsoft.AspNetCore.Identity;
using PetCare.Domain.Users;

namespace PetCare.Infrastructure.Auth;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = default!;

    // Enum-based status (Active, Inactive, Suspended, etc.)
    public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;

    // Convenience bool for queries/UI (not mapped in DB, just derived)
    public bool IsActive => AccountStatus == AccountStatus.Active;
}

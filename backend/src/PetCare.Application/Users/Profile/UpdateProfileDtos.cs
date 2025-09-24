namespace PetCare.Application.Users.Profile;

public sealed class UpdateProfileRequest
{
    public string FullName { get; set; } = default!;
    public string? PhoneNumber { get; set; }
}

public sealed class UpdateProfileResponse
{
    public string Id { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = default!;
}

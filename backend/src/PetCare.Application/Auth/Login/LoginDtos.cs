namespace PetCare.Application.Auth.Login;

public sealed class LoginRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public sealed class LoginResponse
{
    public string AccessToken { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }

    public UserDto User { get; set; } = default!;

    public sealed class UserDto
    {
        public string Id { get; set; } = default!;
        public string Role { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
    }
}

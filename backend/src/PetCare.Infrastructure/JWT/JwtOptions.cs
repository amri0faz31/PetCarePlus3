namespace PetCare.Infrastructure.Jwt;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string Secret { get; set; } = default!; // 32+ chars in dev
    public int AccessTokenMinutes { get; set; } = 30; // default
}

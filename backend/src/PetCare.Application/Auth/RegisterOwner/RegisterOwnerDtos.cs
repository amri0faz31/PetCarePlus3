namespace PetCare.Application.Auth.RegisterOwner;

public sealed class RegisterOwnerRequest
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;

    public PetRequest? Pet { get; set; }

    public sealed class PetRequest
    {
        public string Name { get; set; } = default!;
        public string Species { get; set; } = default!;
        public string? Breed { get; set; }
        public DateTime? Dob { get; set; }
    }
}

public sealed class RegisterOwnerResponse
{
    public string Message { get; set; } = "Owner registered successfully.";
}

namespace PetCare.Application.Admin.Users.CreateVet;

public sealed record CreateVetRequest(
    string FullName,
    string Email,
    string Password
);

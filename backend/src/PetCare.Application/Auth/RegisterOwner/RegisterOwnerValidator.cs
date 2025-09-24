using FluentValidation;

namespace PetCare.Application.Auth.RegisterOwner;

public sealed class RegisterOwnerValidator : AbstractValidator<RegisterOwnerRequest>
{
    public RegisterOwnerValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().MaximumLength(128);

        RuleFor(x => x.Email)
            .NotEmpty().EmailAddress();

        // Password ≥ 8 chars, must contain at least one letter & one number
        RuleFor(x => x.Password)
            .NotEmpty()
            .Matches(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$")
            .WithMessage("Password must be at least 8 characters and contain letters and numbers.");

        When(x => x.Pet is not null, () =>
        {
            RuleFor(x => x.Pet!.Name).NotEmpty().MaximumLength(60);
            RuleFor(x => x.Pet!.Species).NotEmpty().MaximumLength(40);
            RuleFor(x => x.Pet!.Breed).MaximumLength(60);
            RuleFor(x => x.Pet!.Dob)
                .Must(d => d is null || d.Value.Date <= DateTime.UtcNow.Date)
                .WithMessage("Pet DOB cannot be in the future.");
        });
    }
}

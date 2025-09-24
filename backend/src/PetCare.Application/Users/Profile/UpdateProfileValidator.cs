using FluentValidation;

namespace PetCare.Application.Users.Profile;

public sealed class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(128);

        // Optional phone number with a light sanity check (digits, +, -, spaces)
        RuleFor(x => x.PhoneNumber)
            .MaximumLength(25)
            .Matches(@"^[\d\+\-\s]*$").When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("Phone number may contain digits, spaces, + or - only.");
    }
}

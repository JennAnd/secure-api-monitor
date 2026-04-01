// Validates user registration input before a new account is created

using FluentValidation;
using SecureApiMonitor.Api.Auth.Requests;

namespace SecureApiMonitor.Api.Validators;

/// <summary>
/// Validation rules for user registration input
/// </summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(5).WithMessage("Username must be at least 5 characters long.")
            .MaximumLength(30).WithMessage("Username cannot be longer than 30 characters.")
            .Matches(@"^[A-Za-z][A-Za-z0-9_]*$")
            .WithMessage("Username must start with a letter and can only contain letters, numbers, and underscore.");


        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one number.")
            .Matches(@"[^\w\s]").WithMessage("Password must contain at least one special character.");
    }
}

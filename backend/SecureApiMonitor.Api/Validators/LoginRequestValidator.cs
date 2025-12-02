using FluentValidation;
using SecureApiMonitor.Api.Auth.Requests;

namespace SecureApiMonitor.Api.Validators;

/// <summary>
/// Validation rules for user login input
/// </summary>
public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

using System.Security.Claims;                          // ClaimTypes
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCare.Application.Users.Profile;

namespace PetCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    /// <summary>
    /// Self-update for any authenticated user (Owner/Vet/Admin).
    /// Allows updating profile fields defined in UpdateProfileRequest (e.g., FullName, Email).
    /// AccountStatus/roles are admin-only and not handled here.
    /// </summary>
    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(typeof(UpdateProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateMe(
        [FromBody] UpdateProfileRequest request,
        [FromServices] UpdateProfileCommand handler,
        CancellationToken ct)
    {
        // Prefer NameIdentifier; fall back to "sub" if your token uses that.
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var (ok, error, data) = await handler.ExecuteAsync(userId, request, ct);

        if (!ok)
        {
            return error switch
            {
                // If the handler signals the current principal isn't resolvable
                "not_found" => Unauthorized(),

                // If the handler detected an email conflict during update
                "email_in_use" => Conflict(new ProblemDetails
                {
                    Title = "Email already in use",
                    Detail = "Another account already uses this email.",
                    Status = StatusCodes.Status409Conflict
                }),

                // Bubble up identity-specific errors clearly
                _ when error?.StartsWith("identity_error") == true
                    => BadRequest(new ProblemDetails { Title = "Identity error", Detail = error, Status = 400 }),

                // Generic failure
                _ => BadRequest(new ProblemDetails { Title = "Update failed", Detail = error ?? "Unknown error", Status = 400 })
            };
        }

        return Ok(data);
    }
}

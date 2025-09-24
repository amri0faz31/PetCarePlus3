using System;

namespace PetCare.Domain.Pets;

public class Pet
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Owner link (AspNetUsers.Id string)
    public string OwnerUserId { get; set; } = default!;

    // Required
    public string Name { get; set; } = default!;
    public Species Species { get; set; }

    // Optional
    public string? Breed { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Color { get; set; }
    public decimal? Weight { get; set; }
    public string? MedicalNotes { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Computed properties
    public int? AgeInYears => DateOfBirth.HasValue 
        ? (int?)((DateTime.Now - DateOfBirth.Value).Days / 365.25) 
        : null;
}

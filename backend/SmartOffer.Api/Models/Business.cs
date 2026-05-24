using System.ComponentModel.DataAnnotations;

namespace SmartOffer.Api.Models;

public class Business
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string BusinessType { get; set; } = string.Empty; // Restaurant, Gym, Salon, etc.

    [Required, MaxLength(100)]
    public string OwnerName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    public TimeOnly OpeningTime { get; set; }

    public TimeOnly ClosingTime { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
}

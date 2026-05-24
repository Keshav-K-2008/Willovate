using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartOffer.Api.Models;

public enum OfferStatus
{
    Draft,
    Active,
    Paused,
    Expired,
    Cancelled
}

public class Offer
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal OriginalPrice { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal OfferPrice { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal DiscountPercentage { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string TermsAndConditions { get; set; } = string.Empty;

    public OfferStatus Status { get; set; } = OfferStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Business? Business { get; set; }
    public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

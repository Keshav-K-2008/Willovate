using System.ComponentModel.DataAnnotations;

namespace SmartOffer.Api.Models;

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
    NoShow
}

public class Booking
{
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string BookingReference { get; set; } = string.Empty;

    public int OfferId { get; set; }

    public int SlotId { get; set; }

    [Required, MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;

    public int PeopleCount { get; set; } = 1;

    public string SpecialNote { get; set; } = string.Empty;

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Offer? Offer { get; set; }
    public OfferSlot? Slot { get; set; }
}

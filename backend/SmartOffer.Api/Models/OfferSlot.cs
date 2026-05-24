using System.ComponentModel.DataAnnotations;

namespace SmartOffer.Api.Models;

public enum SlotStatus
{
    Available,
    Full,
    Closed,
    Expired,
    Cancelled
}

public class OfferSlot
{
    public int Id { get; set; }

    public int OfferId { get; set; }

    public DateOnly SlotDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int Capacity { get; set; }

    public int BookedCount { get; set; } = 0;

    public SlotStatus Status { get; set; } = SlotStatus.Available;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Offer? Offer { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

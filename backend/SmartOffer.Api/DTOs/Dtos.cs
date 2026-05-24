using SmartOffer.Api.Models;

namespace SmartOffer.Api.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

// ── Business ──────────────────────────────────────────────────────────────────
public class BusinessDto
{
    public string Name { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string OpeningTime { get; set; } = "09:00";
    public string ClosingTime { get; set; } = "21:00";
}

// ── Offer ─────────────────────────────────────────────────────────────────────
public class CreateOfferDto
{
    public int BusinessId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string TermsAndConditions { get; set; } = string.Empty;
    public OfferStatus Status { get; set; } = OfferStatus.Draft;
}

public class UpdateOfferDto : CreateOfferDto { }

// ── Slot ──────────────────────────────────────────────────────────────────────
public class CreateSlotDto
{
    public int OfferId { get; set; }
    public string SlotDate { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public SlotStatus Status { get; set; } = SlotStatus.Available;
}

public class UpdateSlotDto
{
    public string SlotDate { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public SlotStatus Status { get; set; }
}

// ── Booking ───────────────────────────────────────────────────────────────────
public class CreateBookingDto
{
    public int OfferId { get; set; }
    public int SlotId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int PeopleCount { get; set; } = 1;
    public string SpecialNote { get; set; } = string.Empty;
}

public class UpdateBookingStatusDto
{
    public BookingStatus Status { get; set; }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
public class DashboardSummaryDto
{
    public int TotalOffers { get; set; }
    public int ActiveOffers { get; set; }
    public int TotalBookings { get; set; }
    public int ConfirmedBookings { get; set; }
    public int TotalSlots { get; set; }
    public int TotalCapacity { get; set; }
    public int TotalBooked { get; set; }
    public List<RecentBookingDto> RecentBookings { get; set; } = new();
}

public class RecentBookingDto
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string OfferTitle { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public int PeopleCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

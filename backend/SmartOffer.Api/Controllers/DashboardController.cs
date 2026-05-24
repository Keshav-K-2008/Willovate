using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.Api.Data;
using SmartOffer.Api.DTOs;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalOffers = await _db.Offers.CountAsync();
        var activeOffers = await _db.Offers.CountAsync(o => o.Status == OfferStatus.Active);
        var totalBookings = await _db.Bookings.CountAsync();
        var confirmedBookings = await _db.Bookings.CountAsync(b => b.Status == BookingStatus.Confirmed);

        var slots = await _db.OfferSlots.ToListAsync();
        var totalSlots = slots.Count;
        var totalCapacity = slots.Sum(s => s.Capacity);
        var totalBooked = slots.Sum(s => s.BookedCount);

        var recentBookings = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new RecentBookingDto
            {
                Id = b.Id,
                BookingReference = b.BookingReference,
                CustomerName = b.CustomerName,
                OfferTitle = b.Offer!.Title,
                BusinessName = b.Offer.Business!.Name,
                PeopleCount = b.PeopleCount,
                Status = b.Status.ToString(),
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(new DashboardSummaryDto
        {
            TotalOffers = totalOffers,
            ActiveOffers = activeOffers,
            TotalBookings = totalBookings,
            ConfirmedBookings = confirmedBookings,
            TotalSlots = totalSlots,
            TotalCapacity = totalCapacity,
            TotalBooked = totalBooked,
            RecentBookings = recentBookings
        });
    }
}

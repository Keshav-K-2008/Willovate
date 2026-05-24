using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.Api.Data;
using SmartOffer.Api.DTOs;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BookingsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(bookings);
    }

    [HttpGet("export-csv")]
    [Authorize]
    public async Task<IActionResult> ExportCsv()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var builder = new System.Text.StringBuilder();
        builder.AppendLine("Booking Reference,Customer Name,Customer Email,Customer Phone,Offer Title,Business Name,Slot Date,Slot Time,People Count,Status,Created At");

        foreach (var b in bookings)
        {
            var slotDate = b.Slot?.SlotDate.ToString("yyyy-MM-dd") ?? "";
            var slotTime = b.Slot != null ? $"{b.Slot.StartTime:HH:mm} - {b.Slot.EndTime:HH:mm}" : "";
            builder.AppendLine($"\"{b.BookingReference}\",\"{b.CustomerName}\",\"{b.CustomerEmail}\",\"{b.CustomerPhone}\",\"{b.Offer?.Title}\",\"{b.Offer?.Business?.Name}\",\"{slotDate}\",\"{slotTime}\",{b.PeopleCount},\"{b.Status}\",\"{b.CreatedAt:yyyy-MM-dd HH:mm:ss}\"");
        }

        var csvBytes = System.Text.Encoding.UTF8.GetBytes(builder.ToString());
        return File(csvBytes, "text/csv", $"bookings_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound(new { message = "Booking not found." });
        return Ok(booking);
    }

    [HttpGet("reference/{reference}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByReference(string reference)
    {
        var booking = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.BookingReference == reference);
        if (booking == null) return NotFound(new { message = "Booking not found." });
        return Ok(booking);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        // Validate offer exists and is active
        var offer = await _db.Offers.FindAsync(dto.OfferId);
        if (offer == null) return NotFound(new { message = "Offer not found." });
        if (offer.Status != OfferStatus.Active)
            return BadRequest(new { message = "This offer is not currently active." });

        // Check max booking per customer (same phone)
        var existingBookingsCount = await _db.Bookings
            .Where(b => b.OfferId == dto.OfferId && b.CustomerPhone == dto.CustomerPhone && b.Status != BookingStatus.Cancelled)
            .SumAsync(b => b.PeopleCount);
        if (existingBookingsCount + dto.PeopleCount > offer.MaxBookingPerCustomer)
        {
            return BadRequest(new { message = $"Booking limit exceeded. You have already booked {existingBookingsCount} seat(s) for this offer (Max limit: {offer.MaxBookingPerCustomer})." });
        }

        // Validate slot exists
        var slot = await _db.OfferSlots.FindAsync(dto.SlotId);
        if (slot == null) return NotFound(new { message = "Slot not found." });
        if (slot.OfferId != dto.OfferId)
            return BadRequest(new { message = "Slot does not belong to this offer." });

        // Validate slot is available
        if (slot.Status != SlotStatus.Available)
            return BadRequest(new { message = $"Slot is not available. Current status: {slot.Status}." });

        // Validate capacity
        if (slot.BookedCount + dto.PeopleCount > slot.Capacity)
            return BadRequest(new
            {
                message = $"Not enough capacity. Available: {slot.Capacity - slot.BookedCount}, Requested: {dto.PeopleCount}."
            });

        // Generate unique booking reference
        string bookingRef;
        do
        {
            bookingRef = GenerateBookingReference();
        } while (await _db.Bookings.AnyAsync(b => b.BookingReference == bookingRef));

        // Create booking
        var booking = new Booking
        {
            BookingReference = bookingRef,
            OfferId = dto.OfferId,
            SlotId = dto.SlotId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail,
            PeopleCount = dto.PeopleCount,
            SpecialNote = dto.SpecialNote,
            Status = BookingStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };
        _db.Bookings.Add(booking);

        // Increment booked count
        slot.BookedCount += dto.PeopleCount;

        // Update slot status if full
        if (slot.BookedCount >= slot.Capacity)
            slot.Status = SlotStatus.Full;

        await _db.SaveChangesAsync();

        var result = await _db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == booking.Id);

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, result);
    }

    [HttpPut("{id:int}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusDto dto)
    {
        var booking = await _db.Bookings.Include(b => b.Slot).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound(new { message = "Booking not found." });

        var previousStatus = booking.Status;
        booking.Status = dto.Status;

        // If cancelling a confirmed booking, free up slot capacity
        if (dto.Status == BookingStatus.Cancelled &&
            (previousStatus == BookingStatus.Confirmed || previousStatus == BookingStatus.Pending))
        {
            if (booking.Slot != null)
            {
                booking.Slot.BookedCount = Math.Max(0, booking.Slot.BookedCount - booking.PeopleCount);
                if (booking.Slot.Status == SlotStatus.Full)
                    booking.Slot.Status = SlotStatus.Available;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(booking);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await _db.Bookings.Include(b => b.Slot).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound(new { message = "Booking not found." });

        if (booking.Status == BookingStatus.Confirmed || booking.Status == BookingStatus.Pending)
        {
            if (booking.Slot != null)
            {
                booking.Slot.BookedCount = Math.Max(0, booking.Slot.BookedCount - booking.PeopleCount);
                if (booking.Slot.Status == SlotStatus.Full)
                    booking.Slot.Status = SlotStatus.Available;
            }
        }

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Booking deleted successfully." });
    }

    private static string GenerateBookingReference()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return "SOB-" + new string(Enumerable.Repeat(chars, 8).Select(s => s[random.Next(s.Length)]).ToArray());
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.Api.Data;
using SmartOffer.Api.DTOs;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OffersController(AppDbContext db) => _db = db;

    /// <summary>Public: returns only Active offers.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? businessType,
        [FromQuery] string? category,
        [FromQuery] string? date,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? availableOnly)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var expiredOffers = await _db.Offers
            .Where(o => o.Status == OfferStatus.Active && o.EndDate < today)
            .ToListAsync();
        if (expiredOffers.Any())
        {
            foreach (var o in expiredOffers)
            {
                o.Status = OfferStatus.Expired;
            }
            await _db.SaveChangesAsync();
        }

        // Self-heal: seed slots for active offers that have 0 slots
        var activeOffersWithoutSlots = await _db.Offers
            .Include(o => o.Slots)
            .Where(o => o.Status == OfferStatus.Active && !o.Slots.Any())
            .ToListAsync();

        if (activeOffersWithoutSlots.Any())
        {
            foreach (var offer in activeOffersWithoutSlots)
            {
                var currentDate = offer.StartDate;
                while (currentDate <= offer.EndDate)
                {
                    _db.OfferSlots.Add(new OfferSlot
                    {
                        OfferId = offer.Id,
                        SlotDate = currentDate,
                        StartTime = offer.StartTime,
                        EndTime = offer.EndTime,
                        Capacity = 20,
                        BookedCount = 0,
                        Status = SlotStatus.Available,
                        CreatedAt = DateTime.UtcNow
                    });
                    currentDate = currentDate.AddDays(1);
                }
            }
            await _db.SaveChangesAsync();
        }

        var query = _db.Offers
            .Include(o => o.Business)
            .Where(o => o.Status == OfferStatus.Active)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(businessType))
            query = query.Where(o => o.Business!.BusinessType == businessType);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(o => o.Category == category);

        if (!string.IsNullOrWhiteSpace(date) && DateOnly.TryParse(date, out var parsedDate))
        {
            query = query.Where(o => o.StartDate <= parsedDate && o.EndDate >= parsedDate);
        }

        if (minPrice.HasValue)
            query = query.Where(o => o.OfferPrice >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(o => o.OfferPrice <= maxPrice.Value);

        if (availableOnly.HasValue && availableOnly.Value)
        {
            query = query.Where(o => o.Slots.Any(s => s.Status == SlotStatus.Available && s.BookedCount < s.Capacity));
        }

        var offers = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(offers);
    }

    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAllAdmin()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var expiredOffers = await _db.Offers
            .Where(o => o.Status == OfferStatus.Active && o.EndDate < today)
            .ToListAsync();
        if (expiredOffers.Any())
        {
            foreach (var o in expiredOffers)
            {
                o.Status = OfferStatus.Expired;
            }
            await _db.SaveChangesAsync();
        }

        var offers = await _db.Offers
            .Include(o => o.Business)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return Ok(offers);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var offer = await _db.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return NotFound(new { message = "Offer not found." });

        if (offer.Status == OfferStatus.Active && offer.EndDate < DateOnly.FromDateTime(DateTime.UtcNow))
        {
            offer.Status = OfferStatus.Expired;
            await _db.SaveChangesAsync();
        }

        // Public endpoint: hide cancelled/expired
        if (!User.Identity!.IsAuthenticated &&
            (offer.Status == OfferStatus.Cancelled || offer.Status == OfferStatus.Expired))
            return NotFound(new { message = "Offer not available." });

        return Ok(offer);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateOfferDto dto)
    {
        // Validation: offer price must be less than original price
        if (dto.OfferPrice >= dto.OriginalPrice)
            return BadRequest(new { message = "Offer price must be less than original price." });

        var discount = Math.Round((1 - dto.OfferPrice / dto.OriginalPrice) * 100, 2);

        var offer = new Offer
        {
            BusinessId = dto.BusinessId,
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            OriginalPrice = dto.OriginalPrice,
            OfferPrice = dto.OfferPrice,
            DiscountPercentage = discount,
            StartDate = DateOnly.Parse(dto.StartDate),
            EndDate = DateOnly.Parse(dto.EndDate),
            StartTime = TimeOnly.Parse(dto.StartTime),
            EndTime = TimeOnly.Parse(dto.EndTime),
            MaxBookingPerCustomer = dto.MaxBookingPerCustomer,
            TermsAndConditions = dto.TermsAndConditions,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Offers.Add(offer);
        await _db.SaveChangesAsync();

        // Seed slots if the newly created offer is active
        if (offer.Status == OfferStatus.Active)
        {
            var currentDate = offer.StartDate;
            while (currentDate <= offer.EndDate)
            {
                _db.OfferSlots.Add(new OfferSlot
                {
                    OfferId = offer.Id,
                    SlotDate = currentDate,
                    StartTime = offer.StartTime,
                    EndTime = offer.EndTime,
                    Capacity = 20,
                    BookedCount = 0,
                    Status = SlotStatus.Available,
                    CreatedAt = DateTime.UtcNow
                });
                currentDate = currentDate.AddDays(1);
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = offer.Id }, offer);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOfferDto dto)
    {
        if (dto.OfferPrice >= dto.OriginalPrice)
            return BadRequest(new { message = "Offer price must be less than original price." });

        var offer = await _db.Offers.Include(o => o.Slots).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound(new { message = "Offer not found." });

        offer.BusinessId = dto.BusinessId;
        offer.Title = dto.Title;
        offer.Description = dto.Description;
        offer.Category = dto.Category;
        offer.OriginalPrice = dto.OriginalPrice;
        offer.OfferPrice = dto.OfferPrice;
        offer.DiscountPercentage = Math.Round((1 - dto.OfferPrice / dto.OriginalPrice) * 100, 2);
        offer.StartDate = DateOnly.Parse(dto.StartDate);
        offer.EndDate = DateOnly.Parse(dto.EndDate);
        offer.StartTime = TimeOnly.Parse(dto.StartTime);
        offer.EndTime = TimeOnly.Parse(dto.EndTime);
        offer.MaxBookingPerCustomer = dto.MaxBookingPerCustomer;
        offer.TermsAndConditions = dto.TermsAndConditions;
        offer.Status = dto.Status;
        offer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Seed slots if transitioned to active and has 0 slots
        if (offer.Status == OfferStatus.Active && !offer.Slots.Any())
        {
            var currentDate = offer.StartDate;
            while (currentDate <= offer.EndDate)
            {
                _db.OfferSlots.Add(new OfferSlot
                {
                    OfferId = offer.Id,
                    SlotDate = currentDate,
                    StartTime = offer.StartTime,
                    EndTime = offer.EndTime,
                    Capacity = 20,
                    BookedCount = 0,
                    Status = SlotStatus.Available,
                    CreatedAt = DateTime.UtcNow
                });
                currentDate = currentDate.AddDays(1);
            }
            await _db.SaveChangesAsync();
        }

        return Ok(offer);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var offer = await _db.Offers
            .Include(o => o.Slots).ThenInclude(s => s.Bookings)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound(new { message = "Offer not found." });

        foreach (var slot in offer.Slots)
        {
            _db.Bookings.RemoveRange(slot.Bookings);
        }
        _db.OfferSlots.RemoveRange(offer.Slots);
        _db.Offers.Remove(offer);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Offer deleted successfully." });
    }

    /// <summary>Get all slots for an offer.</summary>
    [HttpGet("{offerId:int}/slots")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSlotsByOffer(int offerId)
    {
        var slots = await _db.OfferSlots
            .Where(s => s.OfferId == offerId)
            .OrderBy(s => s.SlotDate)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
        return Ok(slots);
    }
}

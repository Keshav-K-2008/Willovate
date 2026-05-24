using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.Api.Data;
using SmartOffer.Api.DTOs;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Controllers;

[ApiController]
[Route("api/slots")]
[Authorize]
public class SlotsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SlotsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? offerId)
    {
        var query = _db.OfferSlots.Include(s => s.Offer).AsQueryable();
        if (offerId.HasValue)
            query = query.Where(s => s.OfferId == offerId.Value);

        var slots = await query.OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime).ToListAsync();
        return Ok(slots);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var slot = await _db.OfferSlots.Include(s => s.Offer).FirstOrDefaultAsync(s => s.Id == id);
        if (slot == null) return NotFound(new { message = "Slot not found." });
        return Ok(slot);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSlotDto dto)
    {
        var offer = await _db.Offers.FindAsync(dto.OfferId);
        if (offer == null) return NotFound(new { message = "Offer not found." });

        var slot = new OfferSlot
        {
            OfferId = dto.OfferId,
            SlotDate = DateOnly.Parse(dto.SlotDate),
            StartTime = TimeOnly.Parse(dto.StartTime),
            EndTime = TimeOnly.Parse(dto.EndTime),
            Capacity = dto.Capacity,
            BookedCount = 0,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.OfferSlots.Add(slot);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = slot.Id }, slot);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSlotDto dto)
    {
        var slot = await _db.OfferSlots.FindAsync(id);
        if (slot == null) return NotFound(new { message = "Slot not found." });

        slot.SlotDate = DateOnly.Parse(dto.SlotDate);
        slot.StartTime = TimeOnly.Parse(dto.StartTime);
        slot.EndTime = TimeOnly.Parse(dto.EndTime);
        slot.Capacity = dto.Capacity;
        slot.Status = dto.Status;

        await _db.SaveChangesAsync();
        return Ok(slot);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var slot = await _db.OfferSlots.FindAsync(id);
        if (slot == null) return NotFound(new { message = "Slot not found." });
        slot.Status = SlotStatus.Cancelled;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Slot cancelled." });
    }
}

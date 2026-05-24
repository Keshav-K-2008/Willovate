using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.Api.Data;
using SmartOffer.Api.DTOs;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Controllers;

[ApiController]
[Route("api/business")]
[Authorize]
public class BusinessController : ControllerBase
{
    private readonly AppDbContext _db;
    public BusinessController(AppDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var businesses = await _db.Businesses
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(businesses);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business == null) return NotFound(new { message = "Business not found." });
        return Ok(business);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BusinessDto dto)
    {
        var business = new Business
        {
            Name = dto.Name,
            BusinessType = dto.BusinessType,
            OwnerName = dto.OwnerName,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            City = dto.City,
            OpeningTime = TimeOnly.Parse(dto.OpeningTime),
            ClosingTime = TimeOnly.Parse(dto.ClosingTime),
            CreatedAt = DateTime.UtcNow
        };
        _db.Businesses.Add(business);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = business.Id }, business);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BusinessDto dto)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business == null) return NotFound(new { message = "Business not found." });

        business.Name = dto.Name;
        business.BusinessType = dto.BusinessType;
        business.OwnerName = dto.OwnerName;
        business.Phone = dto.Phone;
        business.Email = dto.Email;
        business.Address = dto.Address;
        business.City = dto.City;
        business.OpeningTime = TimeOnly.Parse(dto.OpeningTime);
        business.ClosingTime = TimeOnly.Parse(dto.ClosingTime);

        await _db.SaveChangesAsync();
        return Ok(business);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business == null) return NotFound(new { message = "Business not found." });
        _db.Businesses.Remove(business);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

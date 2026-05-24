using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartOffer.Api.Models;

namespace SmartOffer.Api.Data;

public class AppDbContext : DbContext
{
    private readonly IConfiguration _config;

    public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)
    {
        _config = config;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferSlot> OfferSlots => Set<OfferSlot>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Business ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Business>(e =>
        {
            e.Property(b => b.OpeningTime).HasColumnType("time");
            e.Property(b => b.ClosingTime).HasColumnType("time");
        });

        // ── Offer ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Offer>(e =>
        {
            e.HasOne(o => o.Business)
             .WithMany(b => b.Offers)
             .HasForeignKey(o => o.BusinessId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(o => o.Status)
             .HasConversion<string>();

            e.Property(o => o.StartDate).HasColumnType("date");
            e.Property(o => o.EndDate).HasColumnType("date");
            e.Property(o => o.StartTime).HasColumnType("time");
            e.Property(o => o.EndTime).HasColumnType("time");
        });

        // ── OfferSlot ─────────────────────────────────────────────────────────
        modelBuilder.Entity<OfferSlot>(e =>
        {
            e.HasOne(s => s.Offer)
             .WithMany(o => o.Slots)
             .HasForeignKey(s => s.OfferId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(s => s.Status)
             .HasConversion<string>();

            e.Property(s => s.SlotDate).HasColumnType("date");
            e.Property(s => s.StartTime).HasColumnType("time");
            e.Property(s => s.EndTime).HasColumnType("time");
        });

        // ── Booking ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasIndex(b => b.BookingReference).IsUnique();

            e.HasOne(b => b.Offer)
             .WithMany(o => o.Bookings)
             .HasForeignKey(b => b.OfferId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(b => b.Slot)
             .WithMany(s => s.Bookings)
             .HasForeignKey(b => b.SlotId)
             .OnDelete(DeleteBehavior.Restrict);

            e.Property(b => b.Status)
             .HasConversion<string>();
        });

        // ── Seed admin user ───────────────────────────────────────────────────
        var adminEmail = _config["AdminCredentials:Email"] ?? "admin@smartoffer.com";
        var adminPassword = _config["AdminCredentials:Password"] ?? "Admin@123";

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Name = "Admin",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = "Admin",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // ── Seed default businesses ───────────────────────────────────────────
        modelBuilder.Entity<Business>().HasData(
            new Business
            {
                Id = 1,
                Name = "Luxe Salon & Spa",
                BusinessType = "Salon",
                OwnerName = "Sarah Jenkins",
                Phone = "555-0199",
                Email = "contact@luxesalon.com",
                Address = "123 Beauty Ave",
                City = "New York",
                OpeningTime = new TimeOnly(9, 0),
                ClosingTime = new TimeOnly(20, 0),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 2,
                Name = "Gourmet Bistro",
                BusinessType = "Restaurant",
                OwnerName = "Chef Pierre",
                Phone = "555-0144",
                Email = "bookings@gourmetbistro.com",
                Address = "456 Culinary St",
                City = "New York",
                OpeningTime = new TimeOnly(11, 0),
                ClosingTime = new TimeOnly(23, 0),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 3,
                Name = "Iron Gym & Fitness",
                BusinessType = "Gym",
                OwnerName = "Arnold Steel",
                Phone = "555-0188",
                Email = "info@irongym.com",
                Address = "789 Power Rd",
                City = "New York",
                OpeningTime = new TimeOnly(6, 0),
                ClosingTime = new TimeOnly(22, 0),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 4,
                Name = "Star Cinema & Entertainment",
                BusinessType = "Entertainment",
                OwnerName = "David Miller",
                Phone = "555-0211",
                Email = "contact@starcinema.com",
                Address = "777 Theatre Blvd",
                City = "New York",
                OpeningTime = new TimeOnly(10, 0),
                ClosingTime = new TimeOnly(23, 30),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 5,
                Name = "Smile Dental Clinic",
                BusinessType = "Dental Care",
                OwnerName = "Dr. Clara Rose",
                Phone = "555-0233",
                Email = "info@smiledental.com",
                Address = "101 Wellness Way",
                City = "New York",
                OpeningTime = new TimeOnly(9, 0),
                ClosingTime = new TimeOnly(17, 0),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 6,
                Name = "The Daily Grind Cafe",
                BusinessType = "Cafe",
                OwnerName = "Emma Watson",
                Phone = "555-0244",
                Email = "emma@dailygrind.com",
                Address = "222 Espresso Rd",
                City = "New York",
                OpeningTime = new TimeOnly(7, 0),
                ClosingTime = new TimeOnly(19, 0),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Business
            {
                Id = 7,
                Name = "Himalayan Wellness Resort",
                BusinessType = "Hotel",
                OwnerName = "Raj Kumar",
                Phone = "555-0255",
                Email = "stay@himalayanresort.com",
                Address = "500 Serenity Hills",
                City = "New York",
                OpeningTime = new TimeOnly(0, 0),
                ClosingTime = new TimeOnly(23, 59),
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}

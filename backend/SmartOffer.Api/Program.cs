using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using SmartOffer.Api.Data;
using SmartOffer.Api.Models;

// Load .env file if it exists in the current directory
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim().Trim('"').Trim('\'');
            Environment.SetEnvironmentVariable(key, val);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// ─── Database: Supabase via Npgsql ───────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── JWT Authentication ───────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ─── Controllers ──────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Smart Offer Slot Booking API",
        Version = "v1",
        Description = "API for managing businesses, offers, slots, and bookings."
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ─── Auto-migrate on startup ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed new businesses dynamically if not already seeded
    if (!db.Businesses.Any(b => b.Id == 4))
    {
        db.Businesses.AddRange(
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
            }
        );
        db.SaveChanges();
    }

    // Seed default offers and slots if not present
    if (db.Offers.Count() < 3)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nextWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        var offer1 = new Offer
        {
            BusinessId = 4,
            Title = "Weekend Movie Mania",
            Description = "Get 40% off on all IMAX tickets this weekend! Valid for any movie of your choice.",
            Category = "Entertainment",
            OriginalPrice = 15.00m,
            OfferPrice = 9.00m,
            DiscountPercentage = 40.00m,
            StartDate = today,
            EndDate = nextWeek,
            StartTime = new TimeOnly(12, 0),
            EndTime = new TimeOnly(22, 0),
            MaxBookingPerCustomer = 4,
            TermsAndConditions = "Valid only for IMAX shows. Cannot be combined with other offers.",
            Status = OfferStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var offer2 = new Offer
        {
            BusinessId = 5,
            Title = "Premium Teeth Whitening & Cleaning",
            Description = "Complete dental hygiene package including whitening consultation, scaling, polishing, and oral wellness checkup.",
            Category = "Dental Care",
            OriginalPrice = 120.00m,
            OfferPrice = 59.99m,
            DiscountPercentage = 50.00m,
            StartDate = today,
            EndDate = nextWeek,
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
            MaxBookingPerCustomer = 1,
            TermsAndConditions = "Prior booking required. 24-hour cancellation policy applies.",
            Status = OfferStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var offer3 = new Offer
        {
            BusinessId = 6,
            Title = "Espresso & Pastry Combo",
            Description = "Start your day right with a hot freshly brewed espresso paired with a delicious butter croissant.",
            Category = "Cafe",
            OriginalPrice = 8.50m,
            OfferPrice = 4.25m,
            DiscountPercentage = 50.00m,
            StartDate = today,
            EndDate = nextWeek,
            StartTime = new TimeOnly(7, 0),
            EndTime = new TimeOnly(11, 0),
            MaxBookingPerCustomer = 2,
            TermsAndConditions = "Available daily from 7:00 AM to 11:00 AM only.",
            Status = OfferStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Offers.AddRange(offer1, offer2, offer3);
        db.SaveChanges(); // Save to generate Offer IDs

        // Add slots for Offer 1
        db.OfferSlots.AddRange(
            new OfferSlot
            {
                OfferId = offer1.Id,
                SlotDate = today,
                StartTime = new TimeOnly(14, 0),
                EndTime = new TimeOnly(16, 30),
                Capacity = 50,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new OfferSlot
            {
                OfferId = offer1.Id,
                SlotDate = today,
                StartTime = new TimeOnly(18, 0),
                EndTime = new TimeOnly(20, 30),
                Capacity = 50,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        );

        // Add slots for Offer 2
        db.OfferSlots.AddRange(
            new OfferSlot
            {
                OfferId = offer2.Id,
                SlotDate = tomorrow,
                StartTime = new TimeOnly(10, 0),
                EndTime = new TimeOnly(11, 0),
                Capacity = 2,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new OfferSlot
            {
                OfferId = offer2.Id,
                SlotDate = tomorrow,
                StartTime = new TimeOnly(11, 0),
                EndTime = new TimeOnly(12, 0),
                Capacity = 2,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        );

        // Add slots for Offer 3
        db.OfferSlots.AddRange(
            new OfferSlot
            {
                OfferId = offer3.Id,
                SlotDate = today,
                StartTime = new TimeOnly(8, 0),
                EndTime = new TimeOnly(9, 30),
                Capacity = 20,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new OfferSlot
            {
                OfferId = offer3.Id,
                SlotDate = today,
                StartTime = new TimeOnly(9, 30),
                EndTime = new TimeOnly(11, 0),
                Capacity = 20,
                Status = SlotStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        );

        db.SaveChanges();
        Console.WriteLine("[STARTUP] Dynamically seeded 3 active offers with booking slots.");
    }
}

// ─── Middleware Pipeline ──────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Offer API v1"));
}

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure the admin user exists in the database on startup and matches configuration credentials
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var adminEmail = builder.Configuration["AdminCredentials:Email"] ?? "admin@smartoffer.com";
    var adminPassword = builder.Configuration["AdminCredentials:Password"] ?? "Admin@123";

    var adminByEmail = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
    if (adminByEmail != null)
    {
        adminByEmail.Name = "Admin";
        adminByEmail.Role = "Admin";
        adminByEmail.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
        await db.SaveChangesAsync();
        Console.WriteLine($"[STARTUP] Synchronized admin credentials to: {adminEmail} (Name: Admin)");
    }
    else
    {
        var firstAdmin = await db.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (firstAdmin != null)
        {
            firstAdmin.Name = "Admin";
            firstAdmin.Email = adminEmail;
            firstAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            try
            {
                await db.SaveChangesAsync();
                Console.WriteLine($"[STARTUP] Updated existing admin user to: {adminEmail} (Name: Admin)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[STARTUP] Warning: Could not update first admin email due to unique constraint: {ex.Message}");
            }
        }
        else
        {
            db.Users.Add(new User
            {
                Name = "Admin",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
            Console.WriteLine($"[STARTUP] Created default admin credentials: {adminEmail} (Name: Admin)");
        }
    }
}

app.Run();

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
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
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

app.Run();

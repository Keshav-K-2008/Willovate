using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartOffer.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedBusinesses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Businesses",
                columns: new[] { "Id", "Address", "BusinessType", "City", "ClosingTime", "CreatedAt", "Email", "Name", "OpeningTime", "OwnerName", "Phone" },
                values: new object[,]
                {
                    { 1, "123 Beauty Ave", "Salon", "New York", new TimeOnly(20, 0, 0), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@luxesalon.com", "Luxe Salon & Spa", new TimeOnly(9, 0, 0), "Sarah Jenkins", "555-0199" },
                    { 2, "456 Culinary St", "Restaurant", "New York", new TimeOnly(23, 0, 0), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "bookings@gourmetbistro.com", "Gourmet Bistro", new TimeOnly(11, 0, 0), "Chef Pierre", "555-0144" },
                    { 3, "789 Power Rd", "Gym", "New York", new TimeOnly(22, 0, 0), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "info@irongym.com", "Iron Gym & Fitness", new TimeOnly(6, 0, 0), "Arnold Steel", "555-0188" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$1LzKl66.zGuEdn56QBNxPuuV9OHo1HC3ol0/1xSUPoPiMSsCOYFJy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Businesses",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Businesses",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Businesses",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$.1wd5dVe47J/CSemLN4PO.dHesER8m9KeeOm5gg7O.k86myfGvM/K");
        }
    }
}

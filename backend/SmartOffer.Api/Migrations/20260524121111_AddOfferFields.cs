using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartOffer.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "EndTime",
                table: "Offers",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "MaxBookingPerCustomer",
                table: "Offers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                table: "Offers",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin@smartoffer.com", "$2a$11$1rXa.PwSzDJp7DWuN.CHTOHSMTRr9J96YKVrZs8Ig2vFWFziGNnje" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "MaxBookingPerCustomer",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Offers");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "itskeshavk2008@gmail.com", "$2a$11$1LzKl66.zGuEdn56QBNxPuuV9OHo1HC3ol0/1xSUPoPiMSsCOYFJy" });
        }
    }
}

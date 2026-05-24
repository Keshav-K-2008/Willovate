using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartOffer.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "itskeshavk2008@gmail.com", "$2a$11$.1wd5dVe47J/CSemLN4PO.dHesER8m9KeeOm5gg7O.k86myfGvM/K" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin@smartoffer.com", "$2a$11$LYltVKuLiPkNIokMdQAp.uZKAntZ5GjaPT7iYCvGZ5nCsOYswHpXa" });
        }
    }
}

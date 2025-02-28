using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EmailVerificationToken",
                table: "Users",
                newName: "EmailVerificationCode");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Username",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationCode",
                table: "Users",
                newName: "EmailVerificationToken");
        }
    }
}

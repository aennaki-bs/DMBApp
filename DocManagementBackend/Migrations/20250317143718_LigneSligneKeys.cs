using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class LigneSligneKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SousLigneKey",
                table: "SousLignes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LigneKey",
                table: "Lignes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SousLigneCounter",
                table: "Lignes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LigneCouter",
                table: "Documents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SousLigneKey",
                table: "SousLignes");

            migrationBuilder.DropColumn(
                name: "LigneKey",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "SousLigneCounter",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "LigneCouter",
                table: "Documents");
        }
    }
}

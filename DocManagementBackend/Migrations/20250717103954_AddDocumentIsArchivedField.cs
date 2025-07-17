using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentIsArchivedField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Documents");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixErpCodeUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the existing global unique constraint on ERPDocumentCode
            migrationBuilder.DropIndex(
                name: "IX_Documents_ERPDocumentCode",
                table: "Documents");

            // Create a new composite unique constraint on (ERPDocumentCode, TypeId)
            // This allows the same ERP code for different document types
            migrationBuilder.CreateIndex(
                name: "IX_Documents_ERPDocumentCode_TypeId",
                table: "Documents",
                columns: new[] { "ERPDocumentCode", "TypeId" },
                unique: true,
                filter: "[ERPDocumentCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the composite unique constraint
            migrationBuilder.DropIndex(
                name: "IX_Documents_ERPDocumentCode_TypeId",
                table: "Documents");

            // Recreate the original global unique constraint
            migrationBuilder.CreateIndex(
                name: "IX_Documents_ERPDocumentCode",
                table: "Documents",
                column: "ERPDocumentCode",
                unique: true,
                filter: "[ERPDocumentCode] IS NOT NULL");
        }
    }
}

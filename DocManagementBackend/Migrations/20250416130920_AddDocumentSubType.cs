using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentSubType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SubTypeId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SubTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubTypeKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubTypes_DocumentTypes_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "DocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_SubTypeId",
                table: "Documents",
                column: "SubTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SubTypes_DocumentTypeId",
                table: "SubTypes",
                column: "DocumentTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_SubTypes_SubTypeId",
                table: "Documents",
                column: "SubTypeId",
                principalTable: "SubTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_SubTypes_SubTypeId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "SubTypes");

            migrationBuilder.DropIndex(
                name: "IX_Documents_SubTypeId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "SubTypeId",
                table: "Documents");
        }
    }
}

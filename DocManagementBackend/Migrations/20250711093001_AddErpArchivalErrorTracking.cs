using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddErpArchivalErrorTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ErpArchivalErrors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    LigneId = table.Column<int>(type: "int", nullable: true),
                    ErrorType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ErrorDetails = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LigneCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    ResolutionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ResolvedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErpArchivalErrors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ErpArchivalErrors_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ErpArchivalErrors_Lignes_LigneId",
                        column: x => x.LigneId,
                        principalTable: "Lignes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ErpArchivalErrors_Users_ResolvedByUserId",
                        column: x => x.ResolvedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ErpArchivalErrors_DocumentId_IsResolved",
                table: "ErpArchivalErrors",
                columns: new[] { "DocumentId", "IsResolved" });

            migrationBuilder.CreateIndex(
                name: "IX_ErpArchivalErrors_LigneId",
                table: "ErpArchivalErrors",
                column: "LigneId");

            migrationBuilder.CreateIndex(
                name: "IX_ErpArchivalErrors_OccurredAt",
                table: "ErpArchivalErrors",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_ErpArchivalErrors_ResolvedByUserId",
                table: "ErpArchivalErrors",
                column: "ResolvedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErpArchivalErrors");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCircuitProcess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentCircuitDetailId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCircuitCompleted",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasOrderedFlow",
                table: "Circuits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OrderIndex",
                table: "CircuitDetails",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ResponsibleRoleId",
                table: "CircuitDetails",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DocumentCircuitHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    CircuitDetailId = table.Column<int>(type: "int", nullable: false),
                    ProcessedByUserId = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentCircuitHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_CircuitDetails_CircuitDetailId",
                        column: x => x.CircuitDetailId,
                        principalTable: "CircuitDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Users_ProcessedByUserId",
                        column: x => x.ProcessedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CurrentCircuitDetailId",
                table: "Documents",
                column: "CurrentCircuitDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_CircuitDetails_ResponsibleRoleId",
                table: "CircuitDetails",
                column: "ResponsibleRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_CircuitDetailId",
                table: "DocumentCircuitHistory",
                column: "CircuitDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_DocumentId",
                table: "DocumentCircuitHistory",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_ProcessedByUserId",
                table: "DocumentCircuitHistory",
                column: "ProcessedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CircuitDetails_Roles_ResponsibleRoleId",
                table: "CircuitDetails",
                column: "ResponsibleRoleId",
                principalTable: "Roles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_CircuitDetails_CurrentCircuitDetailId",
                table: "Documents",
                column: "CurrentCircuitDetailId",
                principalTable: "CircuitDetails",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CircuitDetails_Roles_ResponsibleRoleId",
                table: "CircuitDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_CircuitDetails_CurrentCircuitDetailId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "DocumentCircuitHistory");

            migrationBuilder.DropIndex(
                name: "IX_Documents_CurrentCircuitDetailId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_CircuitDetails_ResponsibleRoleId",
                table: "CircuitDetails");

            migrationBuilder.DropColumn(
                name: "CurrentCircuitDetailId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "IsCircuitCompleted",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "HasOrderedFlow",
                table: "Circuits");

            migrationBuilder.DropColumn(
                name: "OrderIndex",
                table: "CircuitDetails");

            migrationBuilder.DropColumn(
                name: "ResponsibleRoleId",
                table: "CircuitDetails");
        }
    }
}

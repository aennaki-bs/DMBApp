using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveActionsSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentCircuitHistory_Actions_ActionId",
                table: "DocumentCircuitHistory");

            migrationBuilder.DropTable(
                name: "ActionStatusEffects");

            migrationBuilder.DropTable(
                name: "StepActions");

            migrationBuilder.DropTable(
                name: "Actions");

            migrationBuilder.DropIndex(
                name: "IX_DocumentCircuitHistory_ActionId",
                table: "DocumentCircuitHistory");

            migrationBuilder.DropColumn(
                name: "ActionId",
                table: "DocumentCircuitHistory");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActionId",
                table: "DocumentCircuitHistory",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Actions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActionKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AutoAdvance = table.Column<bool>(type: "bit", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ActionStatusEffects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActionId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    SetsComplete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionStatusEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActionStatusEffects_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActionStatusEffects_Status_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ActionStatusEffects_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StepActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActionId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StepActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StepActions_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StepActions_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_ActionId",
                table: "DocumentCircuitHistory",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionStatusEffects_ActionId",
                table: "ActionStatusEffects",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionStatusEffects_StatusId",
                table: "ActionStatusEffects",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionStatusEffects_StepId",
                table: "ActionStatusEffects",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_StepActions_ActionId",
                table: "StepActions",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_StepActions_StepId",
                table: "StepActions",
                column: "StepId");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentCircuitHistory_Actions_ActionId",
                table: "DocumentCircuitHistory",
                column: "ActionId",
                principalTable: "Actions",
                principalColumn: "Id");
        }
    }
}

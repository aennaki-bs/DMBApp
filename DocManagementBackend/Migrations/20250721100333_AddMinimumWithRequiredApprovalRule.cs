using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddMinimumWithRequiredApprovalRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MinimumApprovals",
                table: "ApprovatorsGroupRules",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequiredMemberIdsJson",
                table: "ApprovatorsGroupRules",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinimumApprovals",
                table: "ApprovatorsGroupRules");

            migrationBuilder.DropColumn(
                name: "RequiredMemberIdsJson",
                table: "ApprovatorsGroupRules");
        }
    }
}

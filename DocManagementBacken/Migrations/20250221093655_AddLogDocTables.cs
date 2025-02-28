using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLogDocTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Document_Users_CreatedByUserId",
                table: "Document");

            migrationBuilder.DropForeignKey(
                name: "FK_LogHistory_Users_UserId",
                table: "LogHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LogHistory",
                table: "LogHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Document",
                table: "Document");

            migrationBuilder.RenameTable(
                name: "LogHistory",
                newName: "LogHistories");

            migrationBuilder.RenameTable(
                name: "Document",
                newName: "Documents");

            migrationBuilder.RenameIndex(
                name: "IX_LogHistory_UserId",
                table: "LogHistories",
                newName: "IX_LogHistories_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Document_CreatedByUserId",
                table: "Documents",
                newName: "IX_Documents_CreatedByUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LogHistories",
                table: "LogHistories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Documents",
                table: "Documents",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_CreatedByUserId",
                table: "Documents",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LogHistories_Users_UserId",
                table: "LogHistories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_CreatedByUserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_LogHistories_Users_UserId",
                table: "LogHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LogHistories",
                table: "LogHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Documents",
                table: "Documents");

            migrationBuilder.RenameTable(
                name: "LogHistories",
                newName: "LogHistory");

            migrationBuilder.RenameTable(
                name: "Documents",
                newName: "Document");

            migrationBuilder.RenameIndex(
                name: "IX_LogHistories_UserId",
                table: "LogHistory",
                newName: "IX_LogHistory_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Documents_CreatedByUserId",
                table: "Document",
                newName: "IX_Document_CreatedByUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LogHistory",
                table: "LogHistory",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Document",
                table: "Document",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Document_Users_CreatedByUserId",
                table: "Document",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LogHistory_Users_UserId",
                table: "LogHistory",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

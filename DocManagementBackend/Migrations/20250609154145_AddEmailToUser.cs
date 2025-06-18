using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Actions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActionKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutoAdvance = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApiSyncConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EndpointName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApiUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PollingIntervalMinutes = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastSyncTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NextSyncTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSyncStatus = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LastErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SuccessfulSyncs = table.Column<int>(type: "int", nullable: false),
                    FailedSyncs = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiSyncConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "DocumentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeAttr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentCounter = table.Column<int>(type: "int", nullable: false),
                    DocCounter = table.Column<int>(type: "int", nullable: false),
                    TierType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GeneralAccounts",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LinesCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneralAccounts", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    LocationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.LocationCode);
                });

            migrationBuilder.CreateTable(
                name: "ResponsibilityCentres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResponsibilityCentres", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                    IsSimpleUser = table.Column<bool>(type: "bit", nullable: false),
                    IsFullUser = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TypeCounter",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Counter = table.Column<int>(type: "int", nullable: false),
                    circuitCounter = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeCounter", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UniteCodes",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ItemsCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniteCodes", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "Vendors",
                columns: table => new
                {
                    VendorCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendors", x => x.VendorCode);
                });

            migrationBuilder.CreateTable(
                name: "Circuits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CircuitKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descriptif = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CrdCounter = table.Column<int>(type: "int", nullable: false),
                    HasOrderedFlow = table.Column<bool>(type: "bit", nullable: false),
                    AllowBacktrack = table.Column<bool>(type: "bit", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Circuits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Circuits_DocumentTypes_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "DocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WebSite = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Identity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    EmailVerificationCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPhoneVerified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsOnline = table.Column<bool>(type: "bit", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProfilePicture = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BackgroundPicture = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ResponsibilityCentreId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_ResponsibilityCentres_ResponsibilityCentreId",
                        column: x => x.ResponsibilityCentreId,
                        principalTable: "ResponsibilityCentres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Unite = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Code);
                    table.ForeignKey(
                        name: "FK_Items_UniteCodes_Unite",
                        column: x => x.Unite,
                        principalTable: "UniteCodes",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Status",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CircuitId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsInitial = table.Column<bool>(type: "bit", nullable: false),
                    IsFinal = table.Column<bool>(type: "bit", nullable: false),
                    IsFlexible = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Status", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Status_Circuits_CircuitId",
                        column: x => x.CircuitId,
                        principalTable: "Circuits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LogHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LogHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LignesElementTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TypeElement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AccountCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LignesElementTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LignesElementTypes_GeneralAccounts_AccountCode",
                        column: x => x.AccountCode,
                        principalTable: "GeneralAccounts",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LignesElementTypes_Items_ItemCode",
                        column: x => x.ItemCode,
                        principalTable: "Items",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ActionStatusEffects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActionId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
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
                });

            migrationBuilder.CreateTable(
                name: "ApprovalResponses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApprovalWritingId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalResponses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovalWritings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    ProcessedByUserId = table.Column<int>(type: "int", nullable: false),
                    ApprovatorId = table.Column<int>(type: "int", nullable: true),
                    ApprovatorsGroupId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWritings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalWritings_Users_ProcessedByUserId",
                        column: x => x.ProcessedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Approvators",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Approvators", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Approvators_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroupRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    RuleType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroupRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroupUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroupUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroupUsers_ApprovatorsGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroupUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Steps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CircuitId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descriptif = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStatusId = table.Column<int>(type: "int", nullable: false),
                    NextStatusId = table.Column<int>(type: "int", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    ApprovatorId = table.Column<int>(type: "int", nullable: true),
                    ApprovatorsGroupId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Steps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Steps_ApprovatorsGroups_ApprovatorsGroupId",
                        column: x => x.ApprovatorsGroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Steps_Approvators_ApprovatorId",
                        column: x => x.ApprovatorId,
                        principalTable: "Approvators",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Steps_Circuits_CircuitId",
                        column: x => x.CircuitId,
                        principalTable: "Circuits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Steps_Status_CurrentStatusId",
                        column: x => x.CurrentStatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Steps_Status_NextStatusId",
                        column: x => x.NextStatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "int", nullable: true),
                    TypeId = table.Column<int>(type: "int", nullable: false),
                    SubTypeId = table.Column<int>(type: "int", nullable: true),
                    CurrentStatusId = table.Column<int>(type: "int", nullable: true),
                    CurrentStepId = table.Column<int>(type: "int", nullable: true),
                    CircuitId = table.Column<int>(type: "int", nullable: true),
                    IsCircuitCompleted = table.Column<bool>(type: "bit", nullable: false),
                    ResponsibilityCentreId = table.Column<int>(type: "int", nullable: true),
                    DocumentKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentAlias = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DocDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ComptableDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DocumentExterne = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LigneCouter = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CustomerOrVendor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Circuits_CircuitId",
                        column: x => x.CircuitId,
                        principalTable: "Circuits",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Customers_CustomerOrVendor",
                        column: x => x.CustomerOrVendor,
                        principalTable: "Customers",
                        principalColumn: "Code");
                    table.ForeignKey(
                        name: "FK_Documents_DocumentTypes_TypeId",
                        column: x => x.TypeId,
                        principalTable: "DocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_ResponsibilityCentres_ResponsibilityCentreId",
                        column: x => x.ResponsibilityCentreId,
                        principalTable: "ResponsibilityCentres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Status_CurrentStatusId",
                        column: x => x.CurrentStatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Steps_CurrentStepId",
                        column: x => x.CurrentStepId,
                        principalTable: "Steps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_SubTypes_SubTypeId",
                        column: x => x.SubTypeId,
                        principalTable: "SubTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Users_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Vendors_CustomerOrVendor",
                        column: x => x.CustomerOrVendor,
                        principalTable: "Vendors",
                        principalColumn: "VendorCode");
                });

            migrationBuilder.CreateTable(
                name: "StepActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    ActionId = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "StepApprovalAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    ApprovatorId = table.Column<int>(type: "int", nullable: true),
                    ApprovatorsGroupId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StepApprovalAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_ApprovatorsGroups_ApprovatorsGroupId",
                        column: x => x.ApprovatorsGroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_Approvators_ApprovatorId",
                        column: x => x.ApprovatorId,
                        principalTable: "Approvators",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentCircuitHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: true),
                    ActionId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    ProcessedByUserId = table.Column<int>(type: "int", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentCircuitHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Status_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentCircuitHistory_Users_ProcessedByUserId",
                        column: x => x.ProcessedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DocumentStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    IsComplete = table.Column<bool>(type: "bit", nullable: false),
                    CompletedByUserId = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentStatus", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentStatus_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentStatus_Status_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Status",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentStatus_Users_CompletedByUserId",
                        column: x => x.CompletedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DocumentStepHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TransitionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentStepHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentStepHistory_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentStepHistory_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentStepHistory_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Lignes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    LigneKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Article = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prix = table.Column<float>(type: "real", nullable: false),
                    SousLigneCounter = table.Column<int>(type: "int", nullable: false),
                    LignesElementTypeId = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: true),
                    ElementId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    PriceHT = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    VatPercentage = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lignes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lignes_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Lignes_LignesElementTypes_LignesElementTypeId",
                        column: x => x.LignesElementTypeId,
                        principalTable: "LignesElementTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SousLignes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LigneId = table.Column<int>(type: "int", nullable: false),
                    SousLigneKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Attribute = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SousLignes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SousLignes_Lignes_LigneId",
                        column: x => x.LigneId,
                        principalTable: "Lignes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "IsAdmin", "IsFullUser", "IsSimpleUser", "RoleName" },
                values: new object[,]
                {
                    { 1, true, false, false, "Admin" },
                    { 2, false, false, true, "SimpleUser" },
                    { 3, false, true, false, "FullUser" }
                });

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
                name: "IX_ApprovalResponses_ApprovalWritingId",
                table: "ApprovalResponses",
                column: "ApprovalWritingId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalResponses_UserId",
                table: "ApprovalResponses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ApprovatorId",
                table: "ApprovalWritings",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ApprovatorsGroupId",
                table: "ApprovalWritings",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_DocumentId",
                table: "ApprovalWritings",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ProcessedByUserId",
                table: "ApprovalWritings",
                column: "ProcessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_StepId",
                table: "ApprovalWritings",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvators_StepId",
                table: "Approvators",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvators_UserId",
                table: "Approvators",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupRules_GroupId",
                table: "ApprovatorsGroupRules",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroups_StepId",
                table: "ApprovatorsGroups",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupUsers_GroupId",
                table: "ApprovatorsGroupUsers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupUsers_UserId",
                table: "ApprovatorsGroupUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Circuits_DocumentTypeId",
                table: "Circuits",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Code",
                table: "Customers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_ActionId",
                table: "DocumentCircuitHistory",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_DocumentId",
                table: "DocumentCircuitHistory",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_ProcessedByUserId",
                table: "DocumentCircuitHistory",
                column: "ProcessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_StatusId",
                table: "DocumentCircuitHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCircuitHistory_StepId",
                table: "DocumentCircuitHistory",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CircuitId",
                table: "Documents",
                column: "CircuitId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreatedByUserId",
                table: "Documents",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CurrentStatusId",
                table: "Documents",
                column: "CurrentStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CurrentStepId",
                table: "Documents",
                column: "CurrentStepId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CustomerOrVendor",
                table: "Documents",
                column: "CustomerOrVendor");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ResponsibilityCentreId",
                table: "Documents",
                column: "ResponsibilityCentreId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_SubTypeId",
                table: "Documents",
                column: "SubTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TypeId",
                table: "Documents",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UpdatedByUserId",
                table: "Documents",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId",
                table: "Documents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStatus_CompletedByUserId",
                table: "DocumentStatus",
                column: "CompletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStatus_DocumentId",
                table: "DocumentStatus",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStatus_StatusId",
                table: "DocumentStatus",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStepHistory_DocumentId",
                table: "DocumentStepHistory",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStepHistory_StepId",
                table: "DocumentStepHistory",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentStepHistory_UserId",
                table: "DocumentStepHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralAccounts_Code",
                table: "GeneralAccounts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_Code",
                table: "Items",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_Unite",
                table: "Items",
                column: "Unite");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_DocumentId",
                table: "Lignes",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_LignesElementTypeId",
                table: "Lignes",
                column: "LignesElementTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_AccountCode",
                table: "LignesElementTypes",
                column: "AccountCode");

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_Code",
                table: "LignesElementTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_ItemCode",
                table: "LignesElementTypes",
                column: "ItemCode");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_LocationCode",
                table: "Locations",
                column: "LocationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LogHistories_UserId",
                table: "LogHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ResponsibilityCentres_Code",
                table: "ResponsibilityCentres",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SousLignes_LigneId",
                table: "SousLignes",
                column: "LigneId");

            migrationBuilder.CreateIndex(
                name: "IX_Status_CircuitId",
                table: "Status",
                column: "CircuitId");

            migrationBuilder.CreateIndex(
                name: "IX_StepActions_ActionId",
                table: "StepActions",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_StepActions_StepId",
                table: "StepActions",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_ApprovatorId",
                table: "StepApprovalAssignments",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_ApprovatorsGroupId",
                table: "StepApprovalAssignments",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_StepId",
                table: "StepApprovalAssignments",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_ApprovatorId",
                table: "Steps",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_ApprovatorsGroupId",
                table: "Steps",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_CircuitId",
                table: "Steps",
                column: "CircuitId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_CurrentStatusId",
                table: "Steps",
                column: "CurrentStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_NextStatusId",
                table: "Steps",
                column: "NextStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SubTypes_DocumentTypeId",
                table: "SubTypes",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UniteCodes_Code",
                table: "UniteCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ResponsibilityCentreId",
                table: "Users",
                column: "ResponsibilityCentreId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_VendorCode",
                table: "Vendors",
                column: "VendorCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ActionStatusEffects_Steps_StepId",
                table: "ActionStatusEffects",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalResponses_ApprovalWritings_ApprovalWritingId",
                table: "ApprovalResponses",
                column: "ApprovalWritingId",
                principalTable: "ApprovalWritings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_ApprovatorsGroups_ApprovatorsGroupId",
                table: "ApprovalWritings",
                column: "ApprovatorsGroupId",
                principalTable: "ApprovatorsGroups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_Approvators_ApprovatorId",
                table: "ApprovalWritings",
                column: "ApprovatorId",
                principalTable: "Approvators",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_Documents_DocumentId",
                table: "ApprovalWritings",
                column: "DocumentId",
                principalTable: "Documents",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_Steps_StepId",
                table: "ApprovalWritings",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovatorsGroupRules_ApprovatorsGroups_GroupId",
                table: "ApprovatorsGroupRules",
                column: "GroupId",
                principalTable: "ApprovatorsGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Steps_Status_CurrentStatusId",
                table: "Steps");

            migrationBuilder.DropForeignKey(
                name: "FK_Steps_Status_NextStatusId",
                table: "Steps");

            migrationBuilder.DropForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators");

            migrationBuilder.DropForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups");

            migrationBuilder.DropTable(
                name: "ActionStatusEffects");

            migrationBuilder.DropTable(
                name: "ApiSyncConfigurations");

            migrationBuilder.DropTable(
                name: "ApprovalResponses");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroupRules");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroupUsers");

            migrationBuilder.DropTable(
                name: "DocumentCircuitHistory");

            migrationBuilder.DropTable(
                name: "DocumentStatus");

            migrationBuilder.DropTable(
                name: "DocumentStepHistory");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropTable(
                name: "LogHistories");

            migrationBuilder.DropTable(
                name: "SousLignes");

            migrationBuilder.DropTable(
                name: "StepActions");

            migrationBuilder.DropTable(
                name: "StepApprovalAssignments");

            migrationBuilder.DropTable(
                name: "TypeCounter");

            migrationBuilder.DropTable(
                name: "ApprovalWritings");

            migrationBuilder.DropTable(
                name: "Lignes");

            migrationBuilder.DropTable(
                name: "Actions");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "LignesElementTypes");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "SubTypes");

            migrationBuilder.DropTable(
                name: "Vendors");

            migrationBuilder.DropTable(
                name: "GeneralAccounts");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "UniteCodes");

            migrationBuilder.DropTable(
                name: "Status");

            migrationBuilder.DropTable(
                name: "Steps");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroups");

            migrationBuilder.DropTable(
                name: "Approvators");

            migrationBuilder.DropTable(
                name: "Circuits");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "DocumentTypes");

            migrationBuilder.DropTable(
                name: "ResponsibilityCentres");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}

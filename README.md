rm -rf Migrations
dotnet ef migrations add InitialDatabase
dotnet ef database update
dotnet build
dotnet run

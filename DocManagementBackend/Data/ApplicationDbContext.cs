using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Models;

namespace DocManagementBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public ApplicationDbContext() { }
        public DbSet<User> Users { get; set; }
        public DbSet<LogHistory> LogHistories { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Ligne> Lignes { get; set; }
        public DbSet<SousLigne> SousLignes { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<DocumentType> DocumentTypes { get; set; }
        public DbSet<TypeCounter> TypeCounter { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // modelBuilder.Entity<DocumentType>().HasData(
            //     new DocumentType { Id = 1, TypeName = "Facture" },
            //     new DocumentType { Id = 2, TypeName = "Releve" },
            //     new DocumentType { Id = 3, TypeName = "Bilan" },
            //     new DocumentType { Id = 4, TypeName = "Register" },
            //     new DocumentType { Id = 5, TypeName = "Rapport" }
            // );

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleName = "Admin", IsAdmin = true },
                new Role { Id = 2, RoleName = "SimpleUser", IsSimpleUser = true },
                new Role { Id = 3, RoleName = "FullUser", IsFullUser = true }
            );
        }
    }
}

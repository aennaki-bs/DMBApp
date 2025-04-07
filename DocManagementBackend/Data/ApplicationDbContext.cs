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
        public DbSet<Circuit> Circuits { get; set; }
        public DbSet<CircuitDetail> CircuitDetails { get; set; }
        public DbSet<DocumentCircuitHistory> DocumentCircuitHistory { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DocumentCircuitHistory>()
        .HasOne(d => d.Document)
        .WithMany()
        .HasForeignKey(d => d.DocumentId)
        .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentCircuitHistory>()
                .HasOne(d => d.CircuitDetail)
                .WithMany()
                .HasForeignKey(d => d.CircuitDetailId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentCircuitHistory>()
                .HasOne(d => d.ProcessedBy)
                .WithMany()
                .HasForeignKey(d => d.ProcessedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
                
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleName = "Admin", IsAdmin = true },
                new Role { Id = 2, RoleName = "SimpleUser", IsSimpleUser = true },
                new Role { Id = 3, RoleName = "FullUser", IsFullUser = true }
            );
        }
    }
}

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Models;

namespace FinancialApp.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Goal> Goals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Transaction -> User relationship
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(t => t.UserId)
                .IsRequired();

            // Budget -> User relationship
            modelBuilder.Entity<Budget>()
                .HasOne(b => b.User)
                .WithMany(u => u.Budgets)
                .HasForeignKey(b => b.UserId)
                .IsRequired();

            // Goal -> User relationship
            modelBuilder.Entity<Goal>()
                .HasOne(g => g.User)
                .WithMany(u => u.Goals)
                .HasForeignKey(g => g.UserId)
                .IsRequired();

            // Customize User entity
            modelBuilder.Entity<User>(b =>
            {
                b.Ignore(u => u.EmailConfirmed);
                b.Ignore(u => u.LockoutEnabled);
                b.Ignore(u => u.LockoutEnd);
                b.Ignore(u => u.PhoneNumber);
                b.Ignore(u => u.PhoneNumberConfirmed);
                b.Ignore(u => u.TwoFactorEnabled);
                b.Ignore(u => u.SecurityStamp);
                b.Ignore(u => u.ConcurrencyStamp);
                b.Ignore(u => u.AccessFailedCount);
            });

            // Ignore Identity-related tables
            modelBuilder.Ignore<IdentityUserClaim<string>>();
            modelBuilder.Ignore<IdentityUserLogin<string>>();
            modelBuilder.Ignore<IdentityUserToken<string>>();
            modelBuilder.Ignore<IdentityUserRole<string>>();
            modelBuilder.Ignore<IdentityRoleClaim<string>>();
            modelBuilder.Ignore<IdentityRole>();
        }
    }
}
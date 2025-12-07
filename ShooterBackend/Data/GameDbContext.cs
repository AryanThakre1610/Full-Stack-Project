using Microsoft.EntityFrameworkCore;
using ShooterBackend.Models;

namespace ShooterBackend.Data
{
    public class GameDbContext : DbContext
    {
        public GameDbContext(DbContextOptions<GameDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Character> Characters { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Score> Scores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------------------
            // User -> Role
            // -------------------
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // -------------------
            // Score -> User
            // -------------------
            modelBuilder.Entity<Score>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // -------------------
            // Character -> Inventory (Items)
            // One-to-Many: Each item belongs to one character
            // -------------------
            modelBuilder.Entity<Character>()
                .HasMany(c => c.Inventory)
                .WithOne() // Item has no navigation back to Character
                .OnDelete(DeleteBehavior.NoAction); // avoid multiple cascade paths

            // -------------------
            // Item inheritance (TPH)
            // -------------------
            modelBuilder.Entity<Item>()
                .HasDiscriminator<string>("Category")
                .HasValue<Item>("Item")
                .HasValue<Weapon>("Weapon")
                .HasValue<PowerUp>("PowerUp");


            // modelBuilder.Entity<Role>().HasData(
            //     new Role { Id = 1, Name = "Admin" },
            //     new Role { Id = 2, Name = "User" }
            // );

            // modelBuilder.Entity<User>().HasData(
            //     new User {
            //         Id = 1,
            //         Username = "admin",
            //         Email = "admin@example.com",
            //         PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            //         RoleId = 1
            //     }
            // );
        }
    }
}

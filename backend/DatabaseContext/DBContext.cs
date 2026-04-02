using backend.DatabaseContext.DatabaseModels;
using Microsoft.EntityFrameworkCore;

namespace backend.DatabaseContext;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<Voivodeship> Voivodeships { get; set; } = null!;
    public DbSet<County> Counties { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<Photo> Photos { get; set; } = null!;
    public DbSet<BlockedUsers> BlockedUsers { get; set; } = null!;
    public DbSet<Admins> Admins { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Country>(e =>
        {
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Voivodeship>(e =>
        {
            e.HasIndex(x => new { x.CountryId, x.Name }).IsUnique();
        });

        modelBuilder.Entity<County>(e =>
        {
            e.HasIndex(x => new { x.VoivodeshipId, x.Name }).IsUnique();
        });

        modelBuilder.Entity<City>(e =>
        {
            e.HasIndex(x => new { x.CountyId, x.Name }).IsUnique();
        });

        modelBuilder.Entity<BlockedUsers>(e =>
        {
        }
        );

        modelBuilder.Entity<Admins>(e => {

        });

        modelBuilder.Entity<Photo>(e =>
        {
            e.HasIndex(x => x.CountryId).HasDatabaseName("idx_photos_country");
            e.HasIndex(x => x.VoivodeshipId).HasDatabaseName("idx_photos_voivodeship");
            e.HasIndex(x => x.CountyId).HasDatabaseName("idx_photos_county");
            e.HasIndex(x => x.CityId).HasDatabaseName("idx_photos_city");
            e.HasIndex(x => x.YearTaken).HasDatabaseName("idx_photos_year_taken");
            e.HasIndex(x => x.MonthTaken).HasDatabaseName("idx_photos_month_taken");
            e.HasIndex(x => x.DayTaken).HasDatabaseName("idx_photos_day_taken");

            e.HasIndex(x => x.Title)
                .HasDatabaseName("idx_photos_title_trgm")
                .HasMethod("gin")
                .HasOperators("gin_trgm_ops");

            e.HasIndex(x => x.SearchVector)
                .HasDatabaseName("idx_photos_search")
                .HasMethod("gin");

            e.HasOne(p => p.Country)
                .WithMany(c => c.Photos)
                .HasForeignKey(p => p.CountryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.Voivodeship)
                .WithMany(v => v.Photos)
                .HasForeignKey(p => p.VoivodeshipId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.County)
                .WithMany(c => c.Photos)
                .HasForeignKey(p => p.CountyId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.City)
                .WithMany(c => c.Photos)
                .HasForeignKey(p => p.CityId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

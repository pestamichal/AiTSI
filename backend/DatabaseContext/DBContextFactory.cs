using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.DatabaseContext
{
    public class DBContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            
            // Dev connection string, replace with env var based one
            var connectionString = "Host=localhost;Port=5432;Database=aitsi;Username=postgres;Password=secret;";;

            optionsBuilder.UseNpgsql(connectionString, options =>
            {
                options.EnableRetryOnFailure(3);
            });

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}

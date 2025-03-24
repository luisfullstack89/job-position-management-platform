using Microsoft.EntityFrameworkCore;

public class JobPositionsContext : DbContext
{
    public JobPositionsContext(DbContextOptions<JobPositionsContext> options)
        : base(options)
    {
    }

    public DbSet<Position> Positions { get; set; }
}

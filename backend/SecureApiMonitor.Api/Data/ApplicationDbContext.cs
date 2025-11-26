using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Models;

namespace SecureApiMonitor.Api.Data;

// EF Core database context for the application
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ApiRequestLog> ApiRequestLogs { get; set; } = null!;
}

using Microsoft.EntityFrameworkCore;

namespace Web_graph.Data
{
    public class EntityContext : DbContext
    {
        public EntityContext (DbContextOptions<EntityContext> options) : base (options) 
        {
        }

        public DbSet<Entity> Entities { get; set; }
    }
}

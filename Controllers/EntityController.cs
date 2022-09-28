using Microsoft.AspNetCore.Mvc;
using Web_graph.Data;

namespace Web_graph.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EntityController : ControllerBase
    {
        private readonly EntityContext _context;

        public EntityController(EntityContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public Entity[] GetEntities()
        {
            return DBConnector.Connect<Entity>();
        }
    }
}

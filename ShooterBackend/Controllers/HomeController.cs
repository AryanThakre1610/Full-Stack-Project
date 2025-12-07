using Microsoft.AspNetCore.Mvc;

namespace ShooterBackend.Controllers
{
    [ApiController]
    [Route("/")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Content("Shooter Game API is running! Visit /swagger for documentation.", "text/plain");
        }
    }
}

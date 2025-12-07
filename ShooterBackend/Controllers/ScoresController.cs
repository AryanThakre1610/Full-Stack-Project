using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ShooterBackend.Data;
using ShooterBackend.Models;
using ShooterBackend.DTOs;
using System.IdentityModel.Tokens.Jwt;
namespace ShooterBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class ScoresController : ControllerBase
    {
        private readonly GameDbContext _context;

        public ScoresController(GameDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Score>>> GetScores()
        {
            return await _context.Scores
                .Include(s => s.User)
                .OrderByDescending(s => s.Value)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Score>> GetScore(int id)
        {
            var score = await _context.Scores
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (score == null) return NotFound();

            return score;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Score>> CreateScore(ScoreCreateDto dto)
        {
            // var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userId = dto.UserId;
            var existingScore = await _context.Scores.FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingScore != null)
            {
                if (dto.Value > existingScore.Value)
                {
                    existingScore.Value = dto.Value;
                    existingScore.DateAchieved = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return Ok(existingScore);
            }

            var score = new Score
            {
                UserId = userId,
                Value = dto.Value,
                DateAchieved = DateTime.UtcNow
            };

            _context.Scores.Add(score);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetScore), new { id = score.Id }, score);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScore(int id)
        {
            var score = await _context.Scores.FindAsync(id);
            if (score == null) return NotFound();

            _context.Scores.Remove(score);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ShooterBackend.Data;
using ShooterBackend.Models;
using ShooterBackend.DTOs;

namespace ShooterBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Microsoft.AspNetCore.Authorization.Authorize]
    public class CharactersController : ControllerBase
    {
        private readonly GameDbContext _context;
        public CharactersController(GameDbContext context)
        {
            _context = context;
        }

        // GET: api/characters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Character>>> GetCharacters()
        {
            // Include Inventory and optionally selected Weapon
            return await _context.Characters
                    .ToListAsync();
        }

        // GET: api/characters/{id}/inventory
        [HttpGet("{id}/inventory")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetInventory(int id)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (character == null) return NotFound();

            // Map to DTOs
            var inventory = character.Inventory.Select(item => item switch
            {
                Weapon w => new WeaponDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Power = w.Power,
                    Value = w.Value,
                    Type = "Weapon",
                    Damage = w.Damage,
                    Rarity = w.Rarity
                }
            }).ToList();

            return Ok(inventory);
        }

        // GET: api/characters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Character>> GetCharacter(int id)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory) // include inventory items
                .FirstOrDefaultAsync(c => c.Id == id);

            if (character == null)
                return NotFound();

            return character;
        }

        // POST: api/characters
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Character>> CreateCharacter(Character character)
        {
            _context.Characters.Add(character);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCharacter), new { id = character.Id }, character);
        }

        // PUT: api/characters/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCharacter(int id, Character character)
        {
            if (id != character.Id) return BadRequest();

            var existing = await _context.Characters.FindAsync(id);
            if (existing == null) return NotFound();

            // Update only scalar properties
            existing.Name = character.Name;
            existing.Level = character.Level;
            existing.Health = character.Health;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        // DELETE: api/characters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCharacter(int id)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (character == null) return NotFound();

            // Detach inventory items so they are not affected by delete
            foreach (var item in character.Inventory)
            {
                // Remove the character reference if needed
                // (in your current model, Item has no back reference, so this may be optional)
            }

            _context.Characters.Remove(character);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

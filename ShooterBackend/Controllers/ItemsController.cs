using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShooterBackend.Data;
using ShooterBackend.Models;
using ShooterBackend.DTOs;

namespace ShooterBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Microsoft.AspNetCore.Authorization.Authorize]
    public class ItemsController : ControllerBase
    {
        private readonly GameDbContext _context;

        public ItemsController(GameDbContext context)
        {
            _context = context;
        }

        // GET: api/items
        [HttpGet("powerups")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetPowerUps()
        {
            // Fetch each derived type separately
            var powerUps = await _context.Items.OfType<PowerUp>().ToListAsync();

            var powerUpDtos = powerUps.Select(p => new PowerUpDto
            {
                Id = p.Id,
                Name = p.Name,
                Power = p.Power,
                Value = p.Value,
                Type = "PowerUp",
                Effect = p.Effect,
                Duration = p.Duration,
                Damage = p.Damage,
                Rarity = p.Rarity
            });

            return Ok(powerUpDtos);
        }

        // GET: api/items
        [HttpGet("weapons")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetWeapons()
        {
            // Fetch each derived type separately
            var weapons = await _context.Items.OfType<Weapon>().ToListAsync();

            // Map to DTOs
            var weaponDtos = weapons.Select(w => new WeaponDto
            {
                Id = w.Id,
                Name = w.Name,
                Power = w.Power,
                Value = w.Value,
                Type = "Weapon",
                Damage = w.Damage,
                Rarity = w.Rarity
                // CharacterId = w.CharacterId
            });

            return Ok(weaponDtos);
        }

        // GET: api/items/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
                return NotFound();
            return item;
        }

        // POST: api/items
        [HttpPost]
        public async Task<ActionResult<Item>> PostItem([FromBody] Item item)
        {
            _context.Items.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        // PUT: api/items/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutItem(int id, Item item)
        {
            if (id != item.Id)
                return BadRequest();
            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Items.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/items/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -----------------------------
        // Character Inventory Endpoints
        // -----------------------------

        // GET: api/items/character/1
        [HttpGet("character/{characterId}")]
        public async Task<ActionResult<IEnumerable<Item>>> GetCharacterInventory(int characterId)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory)
                .FirstOrDefaultAsync(c => c.Id == characterId);

            if (character == null)
                return NotFound("Character not found.");

            return Ok(character.Inventory);
        }

        // POST: api/items/character/1/add/2
        [HttpPost("character/{characterId}/add/{itemId}")]
        public async Task<IActionResult> AddItemToCharacter(int characterId, int itemId)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory)
                .FirstOrDefaultAsync(c => c.Id == characterId);
            if (character == null)
                return NotFound("Character not found.");

            var item = await _context.Items.FindAsync(itemId);
            if (item == null)
                return NotFound("Item not found.");

            if (!character.Inventory.Contains(item))
                character.Inventory.Add(item);

            await _context.SaveChangesAsync();
            return Ok(character.Inventory);
        }

        // DELETE: api/items/character/1/remove/2
        [HttpDelete("character/{characterId}/remove/{itemId}")]
        public async Task<IActionResult> RemoveItemFromCharacter(int characterId, int itemId)
        {
            var character = await _context.Characters
                .Include(c => c.Inventory)
                .FirstOrDefaultAsync(c => c.Id == characterId);
            if (character == null)
                return NotFound("Character not found.");

            var item = character.Inventory.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
                return NotFound("Item not in inventory.");

            character.Inventory.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(character.Inventory);
        }
    }
}


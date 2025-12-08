namespace ShooterBackend.DTOs
{
    // Base DTO
    public class ItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Power { get; set; }
        public double Value { get; set; }
        public string Type { get; set; } // "Weapon", "PowerUp", or "Item"
    }

    // Weapon DTO
    public class WeaponDto : ItemDto
    {
        public int Damage { get; set; }
        public string Rarity { get; set; }
    }

    // PowerUp DTO
    public class PowerUpDto : ItemDto
    {
        public string Effect { get; set; }
        public int Duration { get; set; }
        public int Damage { get; set; }
        public string Rarity { get; set; }
    }
}
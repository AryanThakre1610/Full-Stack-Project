namespace ShooterBackend.Models
{
    public class Character : GameEntity
    {
        public int Level { get; set; }
        public int Health { get; set; }

        // New: Inventory for items
        public ICollection<Item> Inventory { get; set; } = new List<Item>();

        public Character(string name, int level, int health)
            : base(name)
        {
            Level = level;
            Health = health;
        }

        public override void DisplayInfo()
        {
            Console.WriteLine($"[Character] ID: {Id}, Name: {Name}, Level: {Level}, Health: {Health}");
            if (Inventory.Count > 0)
            {
                Console.WriteLine("Inventory:");
                foreach (var item in Inventory)
                {
                    item.DisplayInfo();
                }
            }
        }
    }
}

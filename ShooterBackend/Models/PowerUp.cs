namespace ShooterBackend.Models
{
    public class PowerUp : Item
    {
        public string Effect { get; set; }
        public int Duration { get; set; } // in seconds
        public int Damage { get; set; }
        public string Rarity { get; set; }
        public PowerUp() : base() { } // EF Core

        public PowerUp(string name, int power, double value, string effect, int duration, int damage, string rarity)
            : base(name, power, value)
        {
            Effect = effect;
            Duration = duration;
            Damage = damage;
            Rarity = rarity;
        }

        public override void DisplayInfo()
        {
            Console.WriteLine($"[PowerUp] ID: {Id}, Name: {Name}, Power: {Power}, Effect: {Effect}, Duration: {Duration}s, Value: {Value:C}, Damage: {Damage}, Rarity: {Rarity}");
        }
    }
}

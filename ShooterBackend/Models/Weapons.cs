using System.ComponentModel;

namespace ShooterBackend.Models
{
    public class Weapon : Item
    {
        public int Damage { get; set; }
        public string Rarity { get; set; }
        public Weapon() : base() { }

        public Weapon(string name, int power, double value, int damage, string rarity)
            : base(name, power, value)
        {
            Damage = damage;
            Rarity = rarity;
        }

        public override void DisplayInfo()
        {
            Console.WriteLine($"[Weapon] ID: {Id}, Name: {Name}, Power: {Power}, Damage: {Damage}, Rarity: {Rarity}, Value: {Value:C}");
        }
    }
}

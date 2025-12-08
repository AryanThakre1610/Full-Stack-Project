namespace ShooterBackend.Models
{
    public class Item : GameEntity
    {
        public int Power { get; set; }
        public double Value { get; set; }

        public Item() : base() { }
        public Item(string name, int power, double value)
            : base(name)
        {
            Power = power;
            Value = value;
        }

        public override void DisplayInfo()
        {
            Console.WriteLine($"[Item] ID: {Id}, Name: {Name}, Power: {Power}, Value: {Value:C}");
        }
    }
}

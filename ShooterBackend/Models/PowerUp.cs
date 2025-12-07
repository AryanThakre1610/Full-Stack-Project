namespace ShooterBackend.Models
{
    public class PowerUp : Item
    {
        public string Effect { get; set; }
        public int Duration { get; set; } // in seconds
    
        public PowerUp() : base() { } // EF Core

        public PowerUp(string name, int power, double value, string effect, int duration)
            : base(name, "PowerUp", power, value)
        {
            Effect = effect;
            Duration = duration;
        }

        public override void DisplayInfo()
        {
            Console.WriteLine($"[PowerUp] ID: {Id}, Name: {Name}, Power: {Power}, Effect: {Effect}, Duration: {Duration}s, Value: {Value:C}");
        }
    }
}

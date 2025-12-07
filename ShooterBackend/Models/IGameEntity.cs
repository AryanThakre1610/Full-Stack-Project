namespace ShooterBackend.Models
{
    public interface IGameEntity
    {
        int Id { get; set; }
        string Name { get; set; }
        void DisplayInfo(); // Polymorphic method to display entity info
    }
}
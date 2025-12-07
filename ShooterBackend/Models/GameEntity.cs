namespace ShooterBackend.Models
{
    public abstract class GameEntity : IGameEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }

        protected GameEntity() { }

        protected GameEntity(string name)
        {
            Name = name;
        }

        public abstract void DisplayInfo();
    }
}

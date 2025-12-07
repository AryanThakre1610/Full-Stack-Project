namespace ShooterBackend.Models
{
    public class Score
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int Value { get; set; }
        public DateTime DateAchieved { get; set; }
    }
}
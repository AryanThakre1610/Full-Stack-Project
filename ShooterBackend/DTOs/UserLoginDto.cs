namespace ShooterBackend.DTOs
{
    public class UserLoginDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string? Username { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string? Password { get; set; }
    }
}
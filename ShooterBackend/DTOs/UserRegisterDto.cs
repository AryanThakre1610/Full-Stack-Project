namespace ShooterBackend.DTOs
{
    public class UserRegisterDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(32, MinimumLength = 3)]
        public string? Username { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
        public string? Email { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }

        // public int RoleId { get; set; } = 2; // default to normal User

    }
}
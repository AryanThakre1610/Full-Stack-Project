using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ShooterBackend.Data;
using ShooterBackend.Models;
using ShooterBackend.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace ShooterBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly GameDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(GameDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public IActionResult Register(UserRegisterDto dto)
        {
            if (!ModelState.IsValid){
                return BadRequest(ModelState);
            }
            if (_context.Users.Any(u => u.Username == dto.Username))
                return BadRequest("Username already exists.");

            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("Email already exists.");

            // if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            //     return BadRequest("Password must be at least 6 characters long.");

            var user = new User
            {
                Username = dto.Username!,
                Email = dto.Email!,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password!),
                RoleId = 2 // default = User role
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            string token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),  // ID goes here
                    new Claim("username", user.Username),                         // Username separate
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
                };

                var jwtKey = _config["Jwt:Key"] ?? string.Empty;
                var jwtIssuer = _config["Jwt:Issuer"] ?? string.Empty;
                var jwtAudience = _config["Jwt:Audience"] ?? string.Empty;
                var jwtExpires = int.TryParse(_config["Jwt:ExpiresHours"], out var h) ? h : 1;

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(jwtExpires),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

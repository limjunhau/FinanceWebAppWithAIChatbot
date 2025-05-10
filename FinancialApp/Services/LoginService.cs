using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Threading.Tasks;
using FinancialApp.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Data;
using FinancialApp.Models;
using FinancialApp.Interfaces;

namespace FinancialApp.Services
{
    public class LoginService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public LoginService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<LoginResponse> LoginAsync(string email, string password)
        {
            var user = await _userManager.Users
                            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, email));

            if (user == null)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid credentials (email not found)"
                };
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, password);
            if (!passwordValid)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid credentials (wrong password)"
                };
            }

            var token = GenerateJwtToken(user);
            var expiration = DateTime.Now.AddHours(1);

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                AccessToken = token,
                Expiration = expiration
            };
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["Jwt:SecretKey"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new ArgumentNullException("Jwt:SecretKey", "JWT Secret Key is not configured");
            }
            if (string.IsNullOrEmpty(issuer))
            {
                throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer is not configured");
            }
            if (string.IsNullOrEmpty(audience))
            {
                throw new ArgumentNullException("Jwt:Audience", "JWT Audience is not configured");
            }

            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("IsAdmin", user.IsAdmin.ToString()),
                // Add any other claims you need (e.g., roles, permissions)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        }

        public class LoginResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public string? AccessToken { get; set; }  // Nullable
            public DateTime? Expiration { get; set; } // Nullable
        }
}
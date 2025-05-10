using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using FinancialApp.Models;

namespace FinancialApp.Services
{
    public class SignUpService
    {
        private readonly UserManager<User> _userManager;

        public SignUpService(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<SignUpResponse> RegisterAsync(string email, string password, string fullName)
        {
            var user = new User
            {
                UserName = email,
                Email = email,
                FullName = fullName
            };

            var result = await _userManager.CreateAsync(user,password);

            if (!result.Succeeded)
            {
                return new SignUpResponse
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new SignUpResponse
            {
                Success = true,
                Message = "Registration successful. Please check your email to confirm your account."
            };
        }
    }

    // Custom response model for SignUpService
    public class SignUpResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using FinancialApp.Models;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using FinancialApp.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignUpService _signUpService;
        private readonly LoginService _loginService;
        private readonly IForgotPasswordService _forgotPasswordService;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<User> userManager,
            SignUpService signUpService,
            LoginService loginService,
            IForgotPasswordService forgotPasswordService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signUpService = signUpService;
            _loginService = loginService;
            _forgotPasswordService = forgotPasswordService;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpDto signUpDto)
        {
            var result = await _signUpService.RegisterAsync(signUpDto.Email, signUpDto.Password, signUpDto.FullName);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(new { Message = "User registered successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var loginResult = await _loginService.LoginAsync(loginDto.Email, loginDto.Password);

            if (!loginResult.Success)
            {
                return Unauthorized(loginResult.Message);
            }

            return Ok(new 
            { 
                accessToken = loginResult.AccessToken,
                expiration = loginResult.Expiration,
                message = loginResult.Message
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] RequestOtpDto dto)
        {
            var otp = await _forgotPasswordService.GenerateOtpAndSendEmailAsync(dto.Email);
            if (otp == null)
            {
                return BadRequest("Email not registered.");
            }

            return Ok(new { Message = "OTP sent to your email." });
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var isValid = _forgotPasswordService.VerifyOtp(dto.Email, dto.Otp);
            if (!isValid)
                return BadRequest(new { message = "Invalid OTP" });

            return Ok(new { message = "OTP verified. You may now reset your password." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var result = await _forgotPasswordService.ResetPasswordWithoutTokenAsync(dto.Email, dto.NewPassword);
            if (result.Succeeded)
                return Ok(new { message = "Password reset successfully." });

            return BadRequest(result.Errors);
        }
    }
}
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using FinancialApp.Interfaces;
using FinancialApp.Models;

namespace FinancialApp.Services
{
    public class ForgotPasswordService : IForgotPasswordService
    {
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;

        private static readonly ConcurrentDictionary<string, string> _otpStore = new();
        private static readonly ConcurrentDictionary<string, DateTime> _otpExpirationStore = new();
        private static readonly ConcurrentDictionary<string, bool> _otpVerifiedStore = new();

        public ForgotPasswordService(UserManager<User> userManager, EmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<string> GenerateOtpAndSendEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return null;

            var otp = new Random().Next(100000, 999999).ToString();

            _otpStore[email] = otp;
            _otpExpirationStore[email] = DateTime.UtcNow.AddMinutes(10);

            _emailService.SendOtpEmail(email, otp);

            return otp;
        }

        public bool VerifyOtp(string email, string otp)
        {
            if (_otpStore.TryGetValue(email, out var storedOtp) &&
                _otpExpirationStore.TryGetValue(email, out var expiration))
            {
                if (storedOtp == otp && DateTime.UtcNow <= expiration)
                {
                    _otpStore.TryRemove(email, out _);
                    _otpExpirationStore.TryRemove(email, out _);
                    _otpVerifiedStore[email] = true;
                    return true;
                }
            }

            return false;
        }

        public async Task<IdentityResult> ResetPasswordWithoutTokenAsync(string email, string newPassword)
        {
            if (!_otpVerifiedStore.TryGetValue(email, out var isVerified) || !isVerified)
            {
                return IdentityResult.Failed(new IdentityError { Description = "OTP not verified." });
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return IdentityResult.Failed(new IdentityError { Description = "User not found." });

            _otpVerifiedStore.TryRemove(email, out _);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return await _userManager.ResetPasswordAsync(user, token, newPassword);
        }
    }
}
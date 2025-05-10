using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace FinancialApp.Interfaces
{
    public interface IForgotPasswordService
    {
        Task<string> GenerateOtpAndSendEmailAsync(string email);
        bool VerifyOtp(string email, string otp);
        Task<IdentityResult> ResetPasswordWithoutTokenAsync(string email, string newPassword);
    }
}
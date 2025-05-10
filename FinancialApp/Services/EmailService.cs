using System;
using System.Net;
using System.Net.Mail;
using FinancialApp.Models;
using Microsoft.Extensions.Options;

namespace FinancialApp.Services
{
    public class EmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public void SendOtpEmail(string toEmail, string otp)
        {
            using var smtpClient = new SmtpClient(_emailSettings.SmtpHost)
            {
                Port = _emailSettings.SmtpPort,
                Credentials = new NetworkCredential(_emailSettings.FromEmail, _emailSettings.Password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.FromEmail),
                Subject = "Password Reset OTP",
                Body = $"Your OTP for password reset is: {otp}",
                IsBodyHtml = false,
            };

            mailMessage.To.Add(toEmail);

            try
            {
                smtpClient.Send(mailMessage);
                Console.WriteLine("OTP Email sent successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send OTP email: {ex.Message}");
                // You can also log this exception
            }
        }
    }
}
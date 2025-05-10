using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Data;
using FinancialApp.Models;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Identity;
using DinkToPdf;
using DinkToPdf.Contracts;

namespace FinancialApp.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IConverter _converter;

        public ReportService(ApplicationDbContext context, UserManager<User> userManager, IConverter converter)
        {
            _context = context;
            _userManager = userManager;
            _converter = converter;
        }

        public async Task<UserStatisticsDto> GetUserStatisticsAsync(string userId)
        {
            var totalTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .CountAsync();
            var activeBudget = await _context.Budgets
                .Where(b => b.UserId == userId && b.EndDate >= DateTime.UtcNow)
                .CountAsync();
            var activeGoals = await _context.Goals
                .Where(g => g.UserId == userId && g.TargetDate >= DateTime.UtcNow)
                .CountAsync();

            return new UserStatisticsDto
            {
                TotalTransactions = totalTransactions,
                ActiveBudget = activeBudget,
                ActiveGoals = activeGoals
            };
        }

        public async Task<TransactionSummaryDto> GetTransactionSummaryAsync(string userId)
        {
            var totalTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .CountAsync();
            var totalAmount = await _context.Transactions
                .Where(t => t.UserId == userId)
                .SumAsync(t => t.Amount);
            var avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

            return new TransactionSummaryDto
            {
                TotalTransactions = totalTransactions,
                TotalAmount = totalAmount,
                AverageTransaction = avgTransaction
            };
        }

        public async Task<byte[]> GeneratePdfReportAsync(string userId)
        {
            var transactionSummary = await GetTransactionSummaryAsync(userId);
            var userStatistics = await GetUserStatisticsAsync(userId);

            string htmlContent = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; padding: 20px; }}
                        h1 {{ text-align: center; }}
                        .section {{ margin-bottom: 20px; }}
                    </style>
                </head>
                <body>
                    <h1>User Report</h1>
                    <div class='section'>
                        <h3>Transaction Summary</h3>
                        <p><strong>Total Transactions:</strong> {transactionSummary.TotalTransactions}</p>
                        <p><strong>Total Amount:</strong> {transactionSummary.TotalAmount:C}</p>
                        <p><strong>Average Transaction:</strong> {transactionSummary.AverageTransaction:C}</p>
                    </div>
                    <div class='section'>
                        <h3>User Statistics</h3>
                        <p><strong>Total Transactions:</strong> {userStatistics.TotalTransactions}</p>
                        <p><strong>Active Budgets:</strong> {userStatistics.ActiveBudget}</p>
                        <p><strong>Active Goals:</strong> {userStatistics.ActiveGoals}</p>
                    </div>
                </body>
                </html>";

            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = new GlobalSettings
                {
                    ColorMode = ColorMode.Color,
                    Orientation = Orientation.Portrait,
                    PaperSize = PaperKind.A4
                },
                Objects = {
                    new ObjectSettings
                    {
                        HtmlContent = htmlContent,
                        WebSettings = { DefaultEncoding = "utf-8" }
                    }
                }
            };

            return _converter.Convert(doc);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Services;
using Microsoft.AspNetCore.Identity;
using FinancialApp.Models;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly UserManager<User> _userManager;

        public ReportsController(IReportService reportService, UserManager<User> userManager)
        {
            _reportService = reportService;
            _userManager = userManager;
        }

        // Endpoint to get User Statistics for the authenticated user
        [Authorize]
        [HttpGet("user-stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var userId = _userManager.GetUserId(User); // Get the logged-in user's ID
            var result = await _reportService.GetUserStatisticsAsync(userId);
            return Ok(result);
        }

        // Endpoint to get Transaction Summary for the authenticated user
        [Authorize]
        [HttpGet("transaction-summary")]
        public async Task<IActionResult> GetTransactionSummary()
        {
            var userId = _userManager.GetUserId(User); // Get the logged-in user's ID
            var result = await _reportService.GetTransactionSummaryAsync(userId);
            return Ok(result);
        }

        // Endpoint to export the report as PDF for the authenticated user
        [Authorize]
        [HttpGet("export-pdf")]
        public async Task<IActionResult> ExportReportToPdf()
        {
            var userId = _userManager.GetUserId(User); // Get the logged-in user's ID
            var pdfData = await _reportService.GeneratePdfReportAsync(userId);

            return File(pdfData, "application/pdf", "UserReport.pdf");
        }
    }
}
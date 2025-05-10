using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using FinancialApp.Models;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/budgets")]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetService _budgetService;

        public BudgetController(IBudgetService budgetService)
        {
            _budgetService = budgetService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetBudgets()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
            var budgets = await _budgetService.GetBudgetsAsync(userId);
            return Ok(budgets);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBudget([FromBody] BudgetDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var budget = new Budget
            {
                Title = dto.Title,
                LimitAmount = dto.LimitAmount,
                StartDate = dto.StartDate.ToUniversalTime(),
                EndDate = dto.EndDate.ToUniversalTime(), 
                UserId = userId
            };

            // Create the budget
            var createdBudget = await _budgetService.CreateBudgetAsync(budget);
            return CreatedAtAction(nameof(GetBudgets), new { userId = userId }, createdBudget);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var result = await _budgetService.DeleteBudgetAsync(id, userId);
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
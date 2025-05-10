using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using FinancialApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetTransactions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
            var transactions = await _transactionService.GetTransactionsAsync(userId);
            return Ok(transactions);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            var transaction = new Transaction
            {
                Amount = dto.Amount,
                Category = dto.Category,
                Type = dto.Type,
                GoalId = dto.GoalId,
                BudgetId = dto.BudgetId,
                Date = dto.Date.ToUniversalTime(), 
                UserId = userId
            };

            var createdTransaction = await _transactionService.CreateTransactionAsync(transaction);
            return CreatedAtAction(nameof(GetTransactions), new { userId = userId }, createdTransaction);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            var updatedTransaction = new Transaction
            {
                Amount = dto.Amount,
                Category = dto.Category,
                Type = dto.Type,
                GoalId = dto.GoalId,
                BudgetId = dto.BudgetId,
                Date = dto.Date,
                UserId = userId
            };

            var result = await _transactionService.UpdateTransactionAsync(id, userId, updatedTransaction);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            var result = await _transactionService.DeleteTransactionAsync(id, userId);
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Data;
using FinancialApp.Models;
using FinancialApp.Interfaces;


namespace FinancialApp.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;

        public TransactionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transaction>> GetTransactionsAsync(string userId)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);

            if (transaction.GoalId.HasValue)
            {
                var goal = await _context.Goals.FindAsync(transaction.GoalId.Value);
                if (goal != null)
                {
                    _context.Goals.Update(goal);
                }
            }

            if (transaction.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(transaction.BudgetId.Value);
                if (budget != null)
                {
                    if (transaction.Type == "Income")
                    {
                        budget.LimitAmount += transaction.Amount;
                    }
                    else if (transaction.Type == "Expense")
                    {
                        budget.LimitAmount -= transaction.Amount;
                    }

                    _context.Budgets.Update(budget);
                }
            }

            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<Transaction> UpdateTransactionAsync(int id, string userId, Transaction updatedTransaction)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null) return null;

            if (transaction.GoalId.HasValue)
            {
                var goal = await _context.Goals.FindAsync(transaction.GoalId.Value);
                if (goal != null)
                {
                    _context.Goals.Update(goal);
                }
            }

            if (transaction.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(transaction.BudgetId.Value);
                if (budget != null)
                {
                    if (transaction.Type == "Income")
                    {
                        budget.LimitAmount -= transaction.Amount;
                    }
                    else if (transaction.Type == "Expense")
                    {
                        budget.LimitAmount += transaction.Amount; 
                    }

                    _context.Budgets.Update(budget);
                }
            }

            transaction.Amount = updatedTransaction.Amount;
            transaction.Category = updatedTransaction.Category;
            transaction.Type = updatedTransaction.Type;
            transaction.GoalId = updatedTransaction.GoalId;
            transaction.BudgetId = updatedTransaction.BudgetId;

            if (updatedTransaction.GoalId.HasValue)
            {
                var goal = await _context.Goals.FindAsync(updatedTransaction.GoalId.Value);
                if (goal != null)
                {
                    _context.Goals.Update(goal);
                }
            }

            if (updatedTransaction.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(updatedTransaction.BudgetId.Value);
                if (budget != null)
                {
                    if (updatedTransaction.Type == "Income")
                    {
                        budget.LimitAmount += updatedTransaction.Amount;
                    }
                    else if (updatedTransaction.Type == "Expense")
                    {
                        budget.LimitAmount -= updatedTransaction.Amount;
                    }

                    _context.Budgets.Update(budget);
                }
            }

            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<bool> DeleteTransactionAsync(int id, string userId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null) return false;

            // Reverse the impact on the goal or budget before deletion
            if (transaction.GoalId.HasValue)
            {
                var goal = await _context.Goals.FindAsync(transaction.GoalId.Value);
                if (goal != null)
                {
                    _context.Goals.Update(goal);
                }
            }

            if (transaction.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(transaction.BudgetId.Value);
                if (budget != null)
                {
                    if (transaction.Type == "Income")
                    {
                        budget.LimitAmount -= transaction.Amount;
                    }
                    else if (transaction.Type == "Expense")
                    {
                        budget.LimitAmount += transaction.Amount;
                    }

                    _context.Budgets.Update(budget);
                }
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
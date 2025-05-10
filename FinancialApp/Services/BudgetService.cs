using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Data;
using FinancialApp.Models;
using FinancialApp.Interfaces;

namespace FinancialApp.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly ApplicationDbContext _context;

        public BudgetService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Budget>> GetBudgetsAsync(string userId)
        {
            return await _context.Budgets
                .Where(b => b.UserId == userId)
                .Include(b => b.Transactions) 
                .ToListAsync();
        }

        public async Task<Budget> CreateBudgetAsync(Budget budget)
        {
            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();
            return budget;
        }

        public async Task<bool> DeleteBudgetAsync(int id, string userId)
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null) return false;

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
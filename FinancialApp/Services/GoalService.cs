using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Data;
using FinancialApp.Models;
using FinancialApp.Interfaces;


namespace FinancialApp.Services
{
    public class GoalService : IGoalService
    {
        private readonly ApplicationDbContext _context;

        public GoalService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Goal>> GetGoalsAsync(string userId)
        {
            return await _context.Goals
                .Where(g => g.UserId == userId)
                .Include(g => g.Transactions)
                .ToListAsync();
        }

        public async Task<Goal> CreateGoalAsync(Goal goal)
        {
            _context.Goals.Add(goal);
            await _context.SaveChangesAsync();
            return goal;
        }

        public async Task<bool> DeleteGoalAsync(int id, string userId)
        {
            var goal = await _context.Goals
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null) return false;

            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
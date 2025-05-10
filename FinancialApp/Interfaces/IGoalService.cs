using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.Models;

namespace FinancialApp.Interfaces
{
    public interface IGoalService
    {
        Task<List<Goal>> GetGoalsAsync(string userId);

        Task<Goal> CreateGoalAsync(Goal goal);

        Task<bool> DeleteGoalAsync(int id, string userId);
    }
}
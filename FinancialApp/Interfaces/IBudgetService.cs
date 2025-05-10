using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Models;

namespace FinancialApp.Interfaces
{
    public interface IBudgetService
    {
        Task<List<Budget>> GetBudgetsAsync(string userId);
        Task<Budget> CreateBudgetAsync(Budget budget);
        Task<bool> DeleteBudgetAsync(int id, string userId);
    }
}
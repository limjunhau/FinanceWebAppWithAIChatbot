using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.Models;

namespace FinancialApp.Interfaces
{
    public interface IAdminService
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string id);
        Task<User?> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(string id);
    }
}
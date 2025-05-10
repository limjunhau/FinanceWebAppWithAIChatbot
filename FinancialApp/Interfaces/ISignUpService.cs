using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace FinancialApp.Interfaces
{
    public interface ISignUpService
    {
        Task<IdentityResult> RegisterAsync(string email, string password, string fullName);
    }
}
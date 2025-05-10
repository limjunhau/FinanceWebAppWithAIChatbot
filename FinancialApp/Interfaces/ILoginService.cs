using System.Threading.Tasks;

namespace FinancialApp.Interfaces
{
    public interface ILoginService
    {
        Task<string> LoginAsync(string email, string password);
    }
}
using System.Threading.Tasks;
using FinancialApp.Models;

namespace FinancialApp.Interfaces
{
    public interface IChatbotService
    {
        Task<string> GetChatbotResponseAsync(string userMessage);
    }
}
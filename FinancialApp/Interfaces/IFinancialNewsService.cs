using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.DTOs;

namespace FinancialApp.Interfaces
{
    public interface IFinancialNewsService
    {
        Task<List<NewsArticle>> GetFinanceNewsAsync();
        
    }
}
using System.Threading.Tasks;
using FinancialApp.DTOs;

namespace FinancialApp.Interfaces
{
    public interface IReportService
    {
        Task<UserStatisticsDto> GetUserStatisticsAsync(string userId);
        
        Task<TransactionSummaryDto> GetTransactionSummaryAsync(string userId);

        Task<byte[]> GeneratePdfReportAsync(string userId);
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.Models;

namespace FinancialApp.Interfaces
{
    public interface ITransactionService
    {
        Task<List<Transaction>> GetTransactionsAsync(string userId);
        
        Task<Transaction> CreateTransactionAsync(Transaction transaction);

        Task<Transaction> UpdateTransactionAsync(int id, string userId, Transaction updatedTransaction);

        Task<bool> DeleteTransactionAsync(int id, string userId);
    }
}

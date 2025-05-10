namespace FinancialApp.DTOs
{
    public class TransactionSummaryDto
    {
        public int TotalTransactions { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AverageTransaction { get; set; }
    }
}
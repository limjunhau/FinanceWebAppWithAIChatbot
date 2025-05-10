namespace FinancialApp.DTOs
{
    public class TransactionDto
    {
        public decimal Amount { get; set; }
        public string Category { get; set; }
        public string Type { get; set; } // "Income" or "Expense"
        public int? GoalId { get; set; }
        public int? BudgetId { get; set; }
        public DateTime Date { get; set; } // add this
    }
}
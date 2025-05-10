using System;
using System.ComponentModel.DataAnnotations;

namespace FinancialApp.DTOs
{
    public class BudgetDto
    {
        [Required]
        public string Title { get; set; } // Example: Food, Transport

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Budget limit must be greater than zero.")]
        public decimal LimitAmount { get; set; }  // Budget limit

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}
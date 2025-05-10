using System;
using System.ComponentModel.DataAnnotations;

namespace FinancialApp.DTOs
{
    public class GoalDto
    {
        [Required]
        public string Title { get; set; }  // e.g., "Vacation Fund", "New Laptop"

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal TargetAmount { get; set; }

        [Required]
        public DateTime TargetDate { get; set; }
    }
}
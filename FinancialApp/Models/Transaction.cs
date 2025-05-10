using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinancialApp.Models
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } // Foreign Key

        public User User { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; }

        public DateTime Date { get; set; }

        [Required]
        [StringLength(10)]
        public string Type { get; set; } // "Income" or "Expense"

        // Optional relationship to Budget
        public int? BudgetId { get; set; }

        [JsonIgnore]
        [ForeignKey("BudgetId")]
        public Budget? Budget { get; set; }

        // Optional relationship to Goal
        public int? GoalId { get; set; }

        [JsonIgnore]
        [ForeignKey("GoalId")]
        public Goal? Goal { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinancialApp.Models
{
    public class Budget
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }  // Foreign Key to User

        public User User { get; set; }  // Navigation Property

        [Required]
        public string Title { get; set; }  // Example: Food, Transport

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal LimitAmount { get; set; }  // Budget limit

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Optional: List of transactions associated with this budget
        [JsonIgnore]
        public List<Transaction> Transactions { get; set; } = new();
    }
}
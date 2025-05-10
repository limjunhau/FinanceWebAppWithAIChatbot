using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinancialApp.Models
{
    public class Goal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public string Title { get; set; }  // e.g., "Vacation Fund", "New Laptop"

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TargetAmount { get; set; }

        [Required]
        public DateTime TargetDate { get; set; }

        // Optional: Track which transactions contributed to this goal
        [JsonIgnore]
        public List<Transaction> Transactions { get; set; } = new();
    }
}
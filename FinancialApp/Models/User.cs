using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace FinancialApp.Models
{
    public class User : IdentityUser
    {
        public string FullName { get; set; }
        public List<Transaction> Transactions { get; set; } = new();
        public List<Budget> Budgets { get; set; } = new();
        public List<Goal> Goals { get; set; } = new();
        public bool IsAdmin { get; set; } = false;
    }
}
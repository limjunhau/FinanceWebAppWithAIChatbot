using System;
using System.ComponentModel.DataAnnotations;

namespace FinancialApp.DTOs
{
    public class EditUserDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
    }
}
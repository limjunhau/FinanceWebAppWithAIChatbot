using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.Interfaces;
using Microsoft.EntityFrameworkCore;
using FinancialApp.Data;
using FinancialApp.Models;

namespace FinancialApp.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> UpdateUserAsync(User updatedUser)
        {
            // Check if email is already used by another user
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == updatedUser.Email && u.Id != updatedUser.Id);

            if (emailExists)
            {
                throw new InvalidOperationException("Email already registered");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == updatedUser.Id);
            if (existingUser == null) return null;

            existingUser.FullName = updatedUser.FullName;
            existingUser.Email = updatedUser.Email;
            existingUser.UserName = updatedUser.UserName;

            await _context.SaveChangesAsync();
            return existingUser;
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
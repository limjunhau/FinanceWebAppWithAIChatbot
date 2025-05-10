using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using FinancialApp.Models;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using FinancialApp.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FinancialApp.Models;
using FinancialApp.DTOs;

namespace FinancialApp.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _adminService.GetUserByIdAsync(id);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] EditUserDto dto)
        {
            try{
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.UserName,
                Id = id
            };

            var updatedUser = await _adminService.UpdateUserAsync(user);
            if (updatedUser == null)
                return NotFound();

            return CreatedAtAction(nameof(GetUserById), new { id = id }, updatedUser);
            }

            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var success = await _adminService.DeleteUserAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}

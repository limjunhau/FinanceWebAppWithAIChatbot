using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FinancialApp.Models;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/goals")]
    public class GoalController : ControllerBase
    {
        private readonly IGoalService _goalService;

        public GoalController(IGoalService goalService)
        {
            _goalService = goalService;
        }

        // Get all goals for the authenticated user
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            // Extract userId from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            // Retrieve the goals associated with the userId
            var goals = await _goalService.GetGoalsAsync(userId);
            return Ok(goals);
        }

        // Create a new goal based on GoalDto
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] GoalDto goalDto)
        {
            // Extract userId from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            // Map GoalDto to Goal model and set the userId
            var goal = new Goal
            {
                Title = goalDto.Title,
                TargetAmount = goalDto.TargetAmount,
                TargetDate = goalDto.TargetDate.ToUniversalTime(),
                UserId = userId // Assign the authenticated user's ID
            };

            // Create goal using the service
            var createdGoal = await _goalService.CreateGoalAsync(goal);

            // Return the created goal with location header
            return CreatedAtAction(nameof(GetGoals), new { userId = goal.UserId }, createdGoal);
        }

        // Delete a goal
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            // Extract userId from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            // Attempt to delete the goal
            var result = await _goalService.DeleteGoalAsync(id, userId);
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
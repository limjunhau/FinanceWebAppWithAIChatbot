using Microsoft.AspNetCore.Mvc;
using FinancialApp.Services;
using FinancialApp.DTOs;
using FinancialApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FinancialApp.Models;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace FinancialApp.Controllers
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;
        private readonly ApplicationDbContext _context;

        public ChatbotController(IChatbotService chatbotService, ApplicationDbContext context)
        {
            _chatbotService = chatbotService;
            _context = context;
        }

        [Authorize]
        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "Message cannot be empty." });
            }

            var advice = await _chatbotService.GetChatbotResponseAsync(request.Message);
            return Ok(new { response = advice });
        }
    }
}
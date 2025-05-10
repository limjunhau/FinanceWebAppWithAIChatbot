using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Services;
using FinancialApp.Interfaces;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/news")]
public class FinancialNewsController : ControllerBase
{
    private readonly IFinancialNewsService _newsService;

    public FinancialNewsController(IFinancialNewsService newsService)
    {
        _newsService = newsService;
    }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<NewsArticle>>> GetFinancialNews()
        {
            var articles = await _newsService.GetFinanceNewsAsync();
            return Ok(articles);
        }
}
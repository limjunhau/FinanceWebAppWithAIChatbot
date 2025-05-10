using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using FinancialApp.DTOs;
using FinancialApp.Interfaces;
using Microsoft.Extensions.Configuration;

public class FinancialNewsService : IFinancialNewsService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public FinancialNewsService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;

        _baseUrl = configuration["NewsApi:BaseUrl"];
        _apiKey = configuration["NewsApi:ApiKey"];

        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("MyFinanceApp/1.0 (+http://localhost:3000)");
    }

    public async Task<List<NewsArticle>> GetFinanceNewsAsync()
    {
        var fullUrl = $"{_baseUrl}?q=finance&language=en&apiKey={_apiKey}";

        var response = await _httpClient.GetAsync(fullUrl);

        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            throw new Exception($"News API failed: {response.StatusCode}\n{content}");
        }

        var json = await response.Content.ReadAsStringAsync();

        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        var articles = new List<NewsArticle>();

        foreach (var item in root.GetProperty("articles").EnumerateArray())
        {
            var article = new NewsArticle
            {
                Title = item.GetProperty("title").GetString(),
                Description = item.GetProperty("description").GetString(),
                Url = item.GetProperty("url").GetString(),
                UrlToImage = item.GetProperty("urlToImage").GetString(),
                PublishedAt = item.GetProperty("publishedAt").GetString(),
                Author = item.GetProperty("author").GetString(),
                SourceName = item.GetProperty("source").GetProperty("name").GetString()
            };

            articles.Add(article);
        }

        return articles;
    }
}
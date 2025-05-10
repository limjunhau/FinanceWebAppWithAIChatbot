using System;
using System.ComponentModel.DataAnnotations;

namespace FinancialApp.DTOs
{
    public class NewsApiResponse
    {
        public string Status { get; set; }
        public int TotalResults { get; set; }
        public List<FinancialArticle> Articles { get; set; }
    }

    public class FinancialArticle
    {
        public Source Source { get; set; }
        public string Author { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string UrlToImage { get; set; }
        public string PublishedAt { get; set; }
    }

    public class Source
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class FinancialArticleDto
    {
        public SourceDto Source { get; set; }
        public string Author { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string UrlToImage { get; set; }
        public string PublishedAt { get; set; }
    }

    public class SourceDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class NewsArticle
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string UrlToImage { get; set; }
        public string PublishedAt { get; set; }
        public string Author { get; set; }
        public string SourceName { get; set; }
    }
}
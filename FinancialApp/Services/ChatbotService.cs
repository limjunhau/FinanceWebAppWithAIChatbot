using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FinancialApp.Interfaces;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using Azure; // Required for ApiKeyCredential
using System.Net.Http;

namespace FinancialApp.Services
{
    public class ChatbotService : IChatbotService
    {
        private readonly ChatClient _chatClient;
        private readonly HttpClient _httpClient;

        public ChatbotService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();

            var endpoint = new Uri(configuration["OpenAI:ApiUrl"]);
            var apiKey = configuration["OpenAI:ApiKey"];

            var options = new OpenAIClientOptions
            {
                Endpoint = endpoint
            };

            var model = configuration["OpenAI:Model"] ?? "openai/gpt-4.1";

            var credential = new AzureKeyCredential(apiKey);

            _chatClient = new ChatClient(model, credential, options);
        }

        public async Task<string> GetChatbotResponseAsync(string userMessage)
        {
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage("You are a helpful and professional financial advisor chatbot. Provide smart, relevant, and clear financial advice based on the user's input. Reject to answer any question beside financial or budget questions"),
                new UserChatMessage(userMessage)
            };

            var requestOptions = new ChatCompletionOptions
            {
                Temperature = 1f,
                TopP = 1f
            };

            try
            {
                var response = await _chatClient.CompleteChatAsync(messages, requestOptions);
                return response.Value.Content[0].Text;
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
    }
}
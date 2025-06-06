using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Services;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestApiSyncController : ControllerBase
    {
        private readonly IApiSyncService _apiSyncService;
        private readonly IBcApiClient _bcApiClient;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestApiSyncController> _logger;

        public TestApiSyncController(
            IApiSyncService apiSyncService,
            IBcApiClient bcApiClient,
            ApplicationDbContext context,
            ILogger<TestApiSyncController> logger)
        {
            _apiSyncService = apiSyncService;
            _bcApiClient = bcApiClient;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Test BC API connection
        /// </summary>
        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                _logger.LogInformation("Testing BC API connection...");
                
                // Test each endpoint
                var results = new Dictionary<string, object>();

                // Test Items endpoint
                try
                {
                    var itemsResponse = await _bcApiClient.GetItemsAsync();
                    results["Items"] = new { 
                        Success = itemsResponse != null, 
                        Count = itemsResponse?.Value?.Count ?? 0,
                        Error = itemsResponse == null ? "No response received" : null
                    };
                }
                catch (Exception ex)
                {
                    results["Items"] = new { Success = false, Error = ex.Message };
                }

                // Test Customers endpoint
                try
                {
                    var customersResponse = await _bcApiClient.GetCustomersAsync();
                    results["Customers"] = new { 
                        Success = customersResponse != null, 
                        Count = customersResponse?.Value?.Count ?? 0,
                        Error = customersResponse == null ? "No response received" : null
                    };
                }
                catch (Exception ex)
                {
                    results["Customers"] = new { Success = false, Error = ex.Message };
                }

                // Test Vendors endpoint
                try
                {
                    var vendorsResponse = await _bcApiClient.GetVendorsAsync();
                    results["Vendors"] = new { 
                        Success = vendorsResponse != null, 
                        Count = vendorsResponse?.Value?.Count ?? 0,
                        Error = vendorsResponse == null ? "No response received" : null
                    };
                }
                catch (Exception ex)
                {
                    results["Vendors"] = new { Success = false, Error = ex.Message };
                }

                // Test General Accounts endpoint
                try
                {
                    var accountsResponse = await _bcApiClient.GetGeneralAccountsAsync();
                    results["GeneralAccounts"] = new { 
                        Success = accountsResponse != null, 
                        Count = accountsResponse?.Value?.Count ?? 0,
                        Error = accountsResponse == null ? "No response received" : null
                    };
                }
                catch (Exception ex)
                {
                    results["GeneralAccounts"] = new { Success = false, Error = ex.Message };
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing BC API connection");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Check sync configurations
        /// </summary>
        [HttpGet("configurations")]
        public async Task<IActionResult> GetConfigurations()
        {
            try
            {
                var configurations = await _context.ApiSyncConfigurations
                    .OrderBy(c => c.EndpointName)
                    .ToListAsync();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configurations");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Manually trigger sync for all endpoints
        /// </summary>
        [HttpPost("sync-now")]
        public async Task<IActionResult> SyncNow()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered from test endpoint");
                var results = await _apiSyncService.SyncAllAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Reset sync times to trigger immediate sync
        /// </summary>
        [HttpPost("reset-sync-times")]
        public async Task<IActionResult> ResetSyncTimes()
        {
            try
            {
                var configurations = await _context.ApiSyncConfigurations.ToListAsync();
                var now = DateTime.UtcNow;
                
                foreach (var config in configurations)
                {
                    config.NextSyncTime = now.AddMinutes(-1); // Set to past time to trigger immediate sync
                    config.IsEnabled = true;
                    config.UpdatedAt = now;
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Reset sync times for {Count} configurations", configurations.Count);
                return Ok(new { Message = $"Reset sync times for {configurations.Count} configurations" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting sync times");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Get current local data counts
        /// </summary>
        [HttpGet("local-data-counts")]
        public async Task<IActionResult> GetLocalDataCounts()
        {
            try
            {
                var counts = new
                {
                    Items = await _context.Items.CountAsync(),
                    GeneralAccounts = await _context.GeneralAccounts.CountAsync(),
                    Customers = await _context.Customers.CountAsync(),
                    Vendors = await _context.Vendors.CountAsync()
                };

                return Ok(counts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting local data counts");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Inspect raw data from BC API endpoints
        /// </summary>
        [HttpGet("inspect-data/{endpoint}")]
        public async Task<IActionResult> InspectData(string endpoint)
        {
            try
            {
                _logger.LogInformation("Inspecting data from {Endpoint}", endpoint);
                
                switch (endpoint.ToLower())
                {
                    case "items":
                        var itemsResponse = await _bcApiClient.GetItemsAsync();
                        return Ok(new { 
                            Success = itemsResponse != null, 
                            Count = itemsResponse?.Value?.Count ?? 0,
                            SampleData = itemsResponse?.Value?.Take(3).ToList(),
                            AllData = itemsResponse?.Value?.ToList()
                        });
                        
                    case "customers":
                        var customersResponse = await _bcApiClient.GetCustomersAsync();
                        return Ok(new { 
                            Success = customersResponse != null, 
                            Count = customersResponse?.Value?.Count ?? 0,
                            SampleData = customersResponse?.Value?.Take(3).ToList(),
                            AllData = customersResponse?.Value?.ToList()
                        });
                        
                    case "vendors":
                        var vendorsResponse = await _bcApiClient.GetVendorsAsync();
                        return Ok(new { 
                            Success = vendorsResponse != null, 
                            Count = vendorsResponse?.Value?.Count ?? 0,
                            SampleData = vendorsResponse?.Value?.Take(3).ToList(),
                            AllData = vendorsResponse?.Value?.ToList()
                        });
                        
                    case "generalaccounts":
                        var accountsResponse = await _bcApiClient.GetGeneralAccountsAsync();
                        return Ok(new { 
                            Success = accountsResponse != null, 
                            Count = accountsResponse?.Value?.Count ?? 0,
                            SampleData = accountsResponse?.Value?.Take(3).ToList(),
                            AllData = accountsResponse?.Value?.ToList()
                        });
                        
                    default:
                        return BadRequest(new { Error = "Invalid endpoint. Use: items, customers, vendors, generalaccounts" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inspecting data from {Endpoint}", endpoint);
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
} 
using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Transit.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class DataEncoderController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DataEncoderController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    [HttpPost("customers")]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Username);

        if (existingUser != null)
            return BadRequest("User with this email or username already exists");

            // Create user first
            var user = Domain.Models.User.CreateUser(
                request.Username,
                request.Email,
                request.FirstName,
                request.LastName,
                "", // Profile photo will be empty initially
                request.Phone,
                BCrypt.Net.BCrypt.HashPassword(request.Password),
                false, // Not super admin
                AccountStatus.Pending
            );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create customer profile
        var customer = Customer.Create(
            request.BusinessName,
            request.TINNumber,
            request.BusinessLicense,
            request.BusinessAddress,
            request.City,
            request.State,
            request.PostalCode,
            request.ContactPerson,
            request.ContactPhone,
            request.ContactEmail,
            request.BusinessType,
            request.ImportLicense,
            request.ImportLicenseExpiry,
            user.Id,
            currentUserId.Value
        );

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(customer);
    }

    /// <summary>
    /// Get all customers created by the data encoder
    /// </summary>
    [HttpGet("customers")]
    public async Task<IActionResult> GetCreatedCustomers(
        [FromQuery] bool? isVerified = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        var query = _context.Customers
            .Include(c => c.User)
            .Include(c => c.VerifiedByUser)
            .Where(c => c.CreatedByDataEncoderId == currentUserId.Value);

        if (isVerified.HasValue)
            query = query.Where(c => c.IsVerified == isVerified.Value);

        var totalCount = await query.CountAsync();
        var customers = await query
            .OrderByDescending(c => c.RegisteredDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PaginatedResult<Customer>
        {
            Data = customers,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };

        return HandleSuccessResponse(result);
    }

    /// <summary>
    /// Create a new service request
    /// </summary>
    [HttpPost("services")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        // Verify customer exists and is verified
        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.IsVerified);

        if (customer == null)
            return BadRequest("Customer not found or not verified");

        // Generate service number
        var serviceNumber = $"SRV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

        var service = Service.Create(
            serviceNumber,
            request.ItemDescription,
            request.RouteCategory,
            request.DeclaredValue,
            request.TaxCategory,
            request.CountryOfOrigin,
            request.ServiceType,
            request.CustomerId,
            currentUserId.Value
        );

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        // Create initial service stages based on service type
        await CreateServiceStages(service.Id, request.ServiceType);

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Get service requests created by the data encoder
    /// </summary>
    [HttpGet("services")]
    public async Task<IActionResult> GetCreatedServices(
        [FromQuery] ServiceStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        var query = _context.Services
            .Include(s => s.Customer)
            .Include(s => s.AssignedCaseExecutor)
            .Include(s => s.AssignedAssessor)
            .Where(s => s.CreatedByDataEncoderId == currentUserId.Value);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        var totalCount = await query.CountAsync();
        var services = await query
            .OrderByDescending(s => s.RegisteredDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PaginatedResult<Service>
        {
            Data = services,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };

        return HandleSuccessResponse(result);
    }

    /// <summary>
    /// Update customer information before approval
    /// </summary>
    [HttpPut("customers/{customerId}")]
    public async Task<IActionResult> UpdateCustomer(long customerId, [FromBody] UpdateCustomerRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == customerId && c.CreatedByDataEncoderId == currentUserId.Value);

        if (customer == null)
            return NotFound("Customer not found or not created by you");

        if (customer.IsVerified)
            return BadRequest("Cannot update verified customer");

        customer.UpdateBusinessInfo(
            request.BusinessName,
            request.BusinessAddress,
            request.City,
            request.State,
            request.PostalCode,
            request.ContactPerson,
            request.ContactPhone,
            request.ContactEmail
        );

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(customer);
    }

    /// <summary>
    /// Get data encoder dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsDataEncoder(currentUserId.Value))
            return Forbid("Access denied. Data Encoder role required.");

        var dashboard = new DataEncoderDashboardResponse
        {
            TotalCustomersCreated = await _context.Customers.CountAsync(c => c.CreatedByDataEncoderId == currentUserId.Value),
            PendingCustomerApprovals = await _context.Customers.CountAsync(c => c.CreatedByDataEncoderId == currentUserId.Value && !c.IsVerified),
            TotalServicesCreated = await _context.Services.CountAsync(s => s.CreatedByDataEncoderId == currentUserId.Value),
            PendingServiceApprovals = await _context.Services.CountAsync(s => s.CreatedByDataEncoderId == currentUserId.Value && s.Status == ServiceStatus.Submitted),
            DraftServices = await _context.Services.CountAsync(s => s.CreatedByDataEncoderId == currentUserId.Value && s.Status == ServiceStatus.Draft)
        };

        // Get recent activities
        dashboard.RecentCustomers = await _context.Customers
            .Include(c => c.User)
            .Where(c => c.CreatedByDataEncoderId == currentUserId.Value)
            .OrderByDescending(c => c.RegisteredDate)
            .Take(5)
            .ToListAsync();

        dashboard.RecentServices = await _context.Services
            .Include(s => s.Customer)
            .Where(s => s.CreatedByDataEncoderId == currentUserId.Value)
            .OrderByDescending(s => s.RegisteredDate)
            .Take(5)
            .ToListAsync();

        return HandleSuccessResponse(dashboard);
    }

    private async Task CreateServiceStages(long serviceId, ServiceType serviceType)
    {
        var stages = new List<ServiceStage>
        {
            ServiceStage.PrepaymentInvoice,
            ServiceStage.DropRisk,
            ServiceStage.DeliveryOrder,
            ServiceStage.Inspection,
            ServiceStage.Emergency,
            ServiceStage.Exit,
            ServiceStage.Transportation,
            ServiceStage.Clearance,
            ServiceStage.StoreSettlement
        };

        // Add unimodal-specific stages
        if (serviceType == ServiceType.Unimodal)
        {
            stages.Add(ServiceStage.LocalPermission);
            stages.Add(ServiceStage.Arrival);
        }

        foreach (var stage in stages)
        {
            var serviceStage = ServiceStageExecution.Create(serviceId, stage);
            _context.ServiceStages.Add(serviceStage);
        }

        await _context.SaveChangesAsync();
    }

    private long? GetCurrentUserId()
    {
        var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            return null;

        return 1; // This should be extracted from the JWT token
    }

    private async Task<bool> IsDataEncoder(long userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.UserRoles.Any(ur => ur.Role.Name == "DataEncoder") ?? false;
    }
}

public class CreateCustomerRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string TINNumber { get; set; } = string.Empty;
    public string BusinessLicense { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string ImportLicense { get; set; } = string.Empty;
    public DateTime? ImportLicenseExpiry { get; set; }
}

public class CreateServiceRequest
{
    public long CustomerId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public string RouteCategory { get; set; } = string.Empty;
    public decimal DeclaredValue { get; set; }
    public string TaxCategory { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
}

public class UpdateCustomerRequest
{
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
}

public class DataEncoderDashboardResponse
{
    public int TotalCustomersCreated { get; set; }
    public int PendingCustomerApprovals { get; set; }
    public int TotalServicesCreated { get; set; }
    public int PendingServiceApprovals { get; set; }
    public int DraftServices { get; set; }
    public List<Customer> RecentCustomers { get; set; } = new();
    public List<Service> RecentServices { get; set; } = new();
}

using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;
using Transit.API.Helpers;
using Mapster;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class CustomerController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CustomerController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

      /// <summary>
    /// Create a new service request as a customer
    /// </summary>
    [HttpPost("services")]
    public async Task<IActionResult> CreateServiceRequest([FromBody] CreateCustomerServiceRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        // Verify customer exists and is verified
        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == currentUserId.Value && c.IsVerified);

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
            customer.Id, // Use customer ID, not user ID
            currentUserId.Value // Use current user as the creator
        );

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        // Create initial service stages based on service type
        await CreateServiceStages(service.Id, request.ServiceType);

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Get all services for the current customer
    /// </summary>
    [HttpGet("services")]
    public async Task<IActionResult> GetMyServices([FromQuery] ServiceStatus? status = null)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        // Get customer for current user
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == currentUserId.Value);

        if (customer == null)
            return BadRequest("Customer profile not found");

        var query = _context.Services
            .Include(s => s.Stages)
            .Include(s => s.Documents)
            .Where(s => s.CustomerId == customer.Id); // Use customer.Id, not customer.UserId

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        var services = await query.ToListAsync();

        return HandleSuccessResponse(services);
    }

    /// <summary>
    /// Get service details with full workflow timeline
    /// </summary>
    [HttpGet("services/{serviceId}")]
    public async Task<IActionResult> GetServiceDetails(long serviceId)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        // Get customer for current user
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == currentUserId.Value);

        if (customer == null)
            return BadRequest("Customer profile not found");

        var service = await _context.Services
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.StageComments)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.Documents)
            .Include(s => s.Documents)
            .Include(s => s.Messages)
            .Include(s => s.AssignedCaseExecutor)
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.CustomerId == customer.Id); // Use customer.Id

        if (service == null)
            return NotFound("Service not found");

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Upload document for a service stage
    /// </summary>
    [HttpPost("services/{serviceId}/stages/{stageId}/documents")]
    public async Task<IActionResult> UploadStageDocument(long serviceId, long stageId, IFormFile file, [FromForm] DocumentType documentType)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        // Verify service belongs to customer
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.CustomerId == currentUserId.Value);
        
        if (service == null)
            return NotFound("Service not found");

        var stage = await _context.ServiceStages
            .FirstOrDefaultAsync(s => s.Id == stageId && s.ServiceId == serviceId);
        
        if (stage == null)
            return NotFound("Service stage not found");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        // Save file
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "service-documents");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Create document record
        var document = StageDocument.Create(
            uniqueFileName,
            Path.Combine("service-documents", uniqueFileName),
            file.FileName,
            Path.GetExtension(file.FileName),
            file.Length,
            file.ContentType,
            documentType,
            stageId,
            currentUserId.Value
        );

        _context.StageDocuments.Add(document);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(document);
    }

    /// <summary>
    /// Get customer notifications
    /// </summary>
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var query = _context.Notifications
            .Include(n => n.Service)
            .Where(n => n.UserId == currentUserId.Value);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.RegisteredDate)
            .ToListAsync();

        return HandleSuccessResponse(notifications);
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPut("notifications/{notificationId}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(long notificationId)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == currentUserId.Value);

        if (notification == null)
            return NotFound("Notification not found");

        notification.MarkAsRead();
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(notification);
    }

    /// <summary>
    /// Get customer profile information
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var customer = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.UserId == currentUserId.Value);

        if (customer == null)
            return NotFound("Customer profile not found");

        return HandleSuccessResponse(customer);
    }

    /// <summary>
    /// Update customer profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == currentUserId.Value);

        if (customer == null)
            return NotFound("Customer profile not found");

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

    private async Task CreateServiceStages(long serviceId, ServiceType serviceType)
    {
        var stages = new List<ServiceStageExecution>();

        // Create stages based on service type
        switch (serviceType)
        {
            case ServiceType.Multimodal:
                stages.AddRange(new[]
                {
                    ServiceStageExecution.Create(serviceId, ServiceStage.PrepaymentInvoice),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DropRisk),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DeliveryOrder),
                    ServiceStageExecution.Create(serviceId, ServiceStage.Inspection),
                    ServiceStageExecution.Create(serviceId, ServiceStage.Transportation),
                    ServiceStageExecution.Create(serviceId, ServiceStage.Clearance)
                });
                break;
            case ServiceType.Unimodal:
                stages.AddRange(new[]
                {
                    ServiceStageExecution.Create(serviceId, ServiceStage.PrepaymentInvoice),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DropRisk),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DeliveryOrder),
                    ServiceStageExecution.Create(serviceId, ServiceStage.Inspection),
                    ServiceStageExecution.Create(serviceId, ServiceStage.LocalPermission),
                    ServiceStageExecution.Create(serviceId, ServiceStage.Arrival),
                    ServiceStageExecution.Create(serviceId, ServiceStage.StoreSettlement)
                });
                break;
            default:
                stages.AddRange(new[]
                {
                    ServiceStageExecution.Create(serviceId, ServiceStage.PrepaymentInvoice),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DropRisk),
                    ServiceStageExecution.Create(serviceId, ServiceStage.DeliveryOrder)
                });
                break;
        }

        _context.ServiceStages.AddRange(stages);
        await _context.SaveChangesAsync();
    }

}

public class CreateCustomerServiceRequest
{
    public string ItemDescription { get; set; } = string.Empty;
    public string RouteCategory { get; set; } = string.Empty;
    public decimal DeclaredValue { get; set; }
    public string TaxCategory { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    public RiskLevel RiskLevel { get; set; } = RiskLevel.Blue;
    public string Priority { get; set; } = "Medium";
    public string SpecialInstructions { get; set; } = string.Empty;
}



public class UpdateCustomerProfileRequest
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

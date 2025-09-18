using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;

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
    /// Get all services for the current customer
    /// </summary>
    [HttpGet("services")]
    public async Task<IActionResult> GetMyServices([FromQuery] ServiceStatus? status = null)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var query = _context.Services
            .Include(s => s.Stages)
            .Include(s => s.Documents)
            .Where(s => s.CustomerId == currentUserId.Value);

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
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.StageComments)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.Documents)
            .Include(s => s.Documents)
            .Include(s => s.Messages)
            .Include(s => s.AssignedCaseExecutor)
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.CustomerId == currentUserId.Value);

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
        var currentUserId = GetCurrentUserId();
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
        var currentUserId = GetCurrentUserId();
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
        var currentUserId = GetCurrentUserId();
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
        var currentUserId = GetCurrentUserId();
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
        var currentUserId = GetCurrentUserId();
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

    private long? GetCurrentUserId()
    {
        var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            return null;

        // Extract user ID from JWT token (you'll need to implement this based on your token structure)
        // For now, returning a placeholder
        return 1; // This should be extracted from the JWT token
    }
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

using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class CaseExecutorController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CaseExecutorController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Get assigned services for the case executor
    /// </summary>
    [HttpGet("services")]
    public async Task<IActionResult> GetAssignedServices(
        [FromQuery] ServiceStatus? status = null,
        [FromQuery] ServiceType? type = null)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var query = _context.Services
            .Include(s => s.Customer)
            .Include(s => s.Stages)
            .Where(s => s.AssignedCaseExecutorId == currentUserId.Value);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (type.HasValue)
            query = query.Where(s => s.ServiceType == type.Value);

        var services = await query
            .OrderByDescending(s => s.RegisteredDate)
            .ToListAsync();

        return HandleSuccessResponse(services);
    }

    /// <summary>
    /// Get service details for execution
    /// </summary>
    [HttpGet("services/{serviceId}")]
    public async Task<IActionResult> GetServiceDetails(long serviceId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .Include(s => s.Customer)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.StageComments)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.Documents)
            .Include(s => s.Documents)
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Update service stage status
    /// </summary>
    [HttpPut("services/{serviceId}/stages/{stageId}/status")]
    public async Task<IActionResult> UpdateStageStatus(
        long serviceId, 
        long stageId, 
        [FromBody] UpdateStageStatusRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

        var stage = await _context.ServiceStages
            .FirstOrDefaultAsync(s => s.Id == stageId && s.ServiceId == serviceId);

        if (stage == null)
            return NotFound("Service stage not found");

        stage.UpdateStatus(request.Status, currentUserId.Value, request.Comments);

        // Update service status if needed
        if (request.Status == StageStatus.Completed)
        {
            // Check if all stages are completed
            var allStages = await _context.ServiceStages
                .Where(s => s.ServiceId == serviceId)
                .ToListAsync();

            if (allStages.All(s => s.Status == StageStatus.Completed))
            {
                service.UpdateStatus(ServiceStatus.Completed);
            }
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(stage);
    }

    /// <summary>
    /// Upload document for a service stage
    /// </summary>
    [HttpPost("services/{serviceId}/stages/{stageId}/documents")]
    public async Task<IActionResult> UploadStageDocument(
        long serviceId, 
        long stageId, 
        IFormFile file, 
        [FromForm] DocumentType documentType,
        [FromForm] string? description = null)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

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
            currentUserId.Value,
            description
        );

        _context.StageDocuments.Add(document);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(document);
    }

    /// <summary>
    /// Add comment to a service stage
    /// </summary>
    [HttpPost("services/{serviceId}/stages/{stageId}/comments")]
    public async Task<IActionResult> AddStageComment(
        long serviceId, 
        long stageId, 
        [FromBody] AddStageCommentRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

        var stage = await _context.ServiceStages
            .FirstOrDefaultAsync(s => s.Id == stageId && s.ServiceId == serviceId);

        if (stage == null)
            return NotFound("Service stage not found");

        var comment = StageComment.Create(
            request.Comment,
            stageId,
            currentUserId.Value,
            request.CommentType,
            request.IsInternal,
            request.IsVisibleToCustomer
        );

        _context.StageComments.Add(comment);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(comment);
    }

    /// <summary>
    /// Set risk level for a service
    /// </summary>
    [HttpPut("services/{serviceId}/risk-level")]
    public async Task<IActionResult> SetRiskLevel(long serviceId, [FromBody] SetRiskLevelRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

        service.UpdateRiskLevel(request.RiskLevel);

        // Add risk notes to the current stage if provided
        if (!string.IsNullOrEmpty(request.RiskNotes))
        {
            var currentStage = await _context.ServiceStages
                .Where(s => s.ServiceId == serviceId)
                .OrderByDescending(s => s.RegisteredDate)
                .FirstOrDefaultAsync();

            if (currentStage != null)
            {
                currentStage.AddRiskNotes(request.RiskNotes);
            }
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Block a service stage
    /// </summary>
    [HttpPut("services/{serviceId}/stages/{stageId}/block")]
    public async Task<IActionResult> BlockStage(long serviceId, long stageId, [FromBody] BlockStageRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AssignedCaseExecutorId == currentUserId.Value);

        if (service == null)
            return NotFound("Service not found or not assigned to you");

        var stage = await _context.ServiceStages
            .FirstOrDefaultAsync(s => s.Id == stageId && s.ServiceId == serviceId);

        if (stage == null)
            return NotFound("Service stage not found");

        stage.SetBlocked(true, request.Reason);

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(stage);
    }

    /// <summary>
    /// Get case executor dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsCaseExecutor(currentUserId.Value))
            return Forbid("Access denied. Case Executor role required.");

        var dashboard = new CaseExecutorDashboardResponse
        {
            AssignedServices = await _context.Services.CountAsync(s => s.AssignedCaseExecutorId == currentUserId.Value),
            PendingServices = await _context.Services.CountAsync(s => s.AssignedCaseExecutorId == currentUserId.Value && s.Status == ServiceStatus.InProgress),
            CompletedServices = await _context.Services.CountAsync(s => s.AssignedCaseExecutorId == currentUserId.Value && s.Status == ServiceStatus.Completed),
            BlockedStages = await _context.ServiceStages.CountAsync(s => s.Service.AssignedCaseExecutorId == currentUserId.Value && s.IsBlocked)
        };

        // Get today's tasks
        dashboard.TodaysTasks = await _context.ServiceStages
            .Include(s => s.Service)
            .Where(s => s.Service.AssignedCaseExecutorId == currentUserId.Value && 
                       s.Status == StageStatus.Pending &&
                       s.RegisteredDate.Date == DateTime.UtcNow.Date)
            .ToListAsync();

        // Get urgent notifications
        dashboard.UrgentNotifications = await _context.Notifications
            .Include(n => n.Service)
            .Where(n => n.UserId == currentUserId.Value && n.IsUrgent && !n.IsRead)
            .ToListAsync();

        return HandleSuccessResponse(dashboard);
    }

    private long? GetCurrentUserId()
    {
        var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            return null;

        return 1; // This should be extracted from the JWT token
    }

    private async Task<bool> IsCaseExecutor(long userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.UserRoles.Any(ur => ur.Role.Name == "CaseExecutor") ?? false;
    }
}

public class UpdateStageStatusRequest
{
    public StageStatus Status { get; set; }
    public string? Comments { get; set; }
}

public class AddStageCommentRequest
{
    public string Comment { get; set; } = string.Empty;
    public string? CommentType { get; set; }
    public bool IsInternal { get; set; } = false;
    public bool IsVisibleToCustomer { get; set; } = true;
}

public class SetRiskLevelRequest
{
    public RiskLevel RiskLevel { get; set; }
    public string? RiskNotes { get; set; }
}

public class BlockStageRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class CaseExecutorDashboardResponse
{
    public int AssignedServices { get; set; }
    public int PendingServices { get; set; }
    public int CompletedServices { get; set; }
    public int BlockedStages { get; set; }
    public List<ServiceStageExecution> TodaysTasks { get; set; } = new();
    public List<Notification> UrgentNotifications { get; set; } = new();
}

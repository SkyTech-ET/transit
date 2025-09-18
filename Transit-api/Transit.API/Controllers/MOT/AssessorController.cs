using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class AssessorController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AssessorController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Get customers pending approval
    /// </summary>
    [HttpGet("customers/pending-approval")]
    public async Task<IActionResult> GetPendingCustomerApprovals()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var customers = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.CreatedByDataEncoder)
            .Include(c => c.Documents)
            .Where(c => !c.IsVerified && c.RecordStatus == RecordStatus.Active)
            .OrderByDescending(c => c.RegisteredDate)
            .ToListAsync();

        return HandleSuccessResponse(customers);
    }

    /// <summary>
    /// Approve or reject a customer
    /// </summary>
    [HttpPut("customers/{customerId}/approve")]
    public async Task<IActionResult> ApproveCustomer(long customerId, [FromBody] CustomerApprovalRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == customerId);

        if (customer == null)
            return NotFound("Customer not found");

        if (request.IsApproved)
        {
            customer.Verify(currentUserId.Value, request.Notes);
        }
        else
        {
            // Handle rejection - you might want to add a rejection status
            customer.UpdateAudit("System");
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(customer);
    }

    /// <summary>
    /// Get service requests pending review
    /// </summary>
    [HttpGet("services/pending-review")]
    public async Task<IActionResult> GetPendingServiceReviews()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var services = await _context.Services
            .Include(s => s.Customer)
            .Include(s => s.CreatedByDataEncoder)
            .Include(s => s.Documents)
            .Where(s => s.Status == ServiceStatus.Submitted)
            .OrderByDescending(s => s.RegisteredDate)
            .ToListAsync();

        return HandleSuccessResponse(services);
    }

    /// <summary>
    /// Review and approve/reject a service request
    /// </summary>
    [HttpPut("services/{serviceId}/review")]
    public async Task<IActionResult> ReviewService(long serviceId, [FromBody] ServiceReviewRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId);

        if (service == null)
            return NotFound("Service not found");

        if (request.IsApproved)
        {
            service.UpdateStatus(ServiceStatus.Approved);
            service.AssignAssessor(currentUserId.Value);
        }
        else
        {
            service.UpdateStatus(ServiceStatus.Rejected);
        }

        // Add review comment if provided
        if (!string.IsNullOrEmpty(request.ReviewNotes))
        {
            var reviewComment = ServiceMessage.Create(
                "Service Review",
                request.ReviewNotes,
                MessageType.System,
                serviceId,
                currentUserId.Value,
                service.CreatedByDataEncoderId
            );

            _context.ServiceMessages.Add(reviewComment);
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Get services under assessor oversight
    /// </summary>
    [HttpGet("services/oversight")]
    public async Task<IActionResult> GetServicesUnderOversight(
        [FromQuery] ServiceStatus? status = null,
        [FromQuery] ServiceType? type = null)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var query = _context.Services
            .Include(s => s.Customer)
            .Include(s => s.AssignedCaseExecutor)
            .Include(s => s.Stages)
            .Where(s => s.AssignedAssessorId == currentUserId.Value);

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
    /// Add compliance feedback to a service
    /// </summary>
    [HttpPost("services/{serviceId}/compliance-feedback")]
    public async Task<IActionResult> AddComplianceFeedback(long serviceId, [FromBody] ComplianceFeedbackRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId);

        if (service == null)
            return NotFound("Service not found");

        var feedback = ServiceMessage.Create(
            "Compliance Feedback",
            request.Feedback,
            MessageType.System,
            serviceId,
            currentUserId.Value,
            service.AssignedCaseExecutorId,
            null,
            true
        );

        _context.ServiceMessages.Add(feedback);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(feedback);
    }

    /// <summary>
    /// Get assessor dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var dashboard = new AssessorDashboardResponse
        {
            PendingCustomerApprovals = await _context.Customers.CountAsync(c => !c.IsVerified && c.RecordStatus == RecordStatus.Active),
            PendingServiceReviews = await _context.Services.CountAsync(s => s.Status == ServiceStatus.Submitted),
            ServicesUnderOversight = await _context.Services.CountAsync(s => s.AssignedAssessorId == currentUserId.Value),
            CompletedReviewsToday = await _context.Services.CountAsync(s => s.AssignedAssessorId == currentUserId.Value && 
                                                                           s.LastUpdateDate.Date == DateTime.UtcNow.Date)
        };

        // Get recent activities
        dashboard.RecentCustomerApprovals = await _context.Customers
            .Include(c => c.User)
            .Where(c => c.VerifiedByUserId == currentUserId.Value)
            .OrderByDescending(c => c.VerifiedAt)
            .Take(5)
            .ToListAsync();

        dashboard.RecentServiceReviews = await _context.Services
            .Include(s => s.Customer)
            .Where(s => s.AssignedAssessorId == currentUserId.Value)
            .OrderByDescending(s => s.LastUpdateDate)
            .Take(5)
            .ToListAsync();

        return HandleSuccessResponse(dashboard);
    }

    /// <summary>
    /// Get compliance issues flagged
    /// </summary>
    [HttpGet("compliance-issues")]
    public async Task<IActionResult> GetComplianceIssues()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        if (!await IsAssessor(currentUserId.Value))
            return Forbid("Access denied. Assessor role required.");

        var issues = await _context.ServiceMessages
            .Include(m => m.Service)
            .Include(m => m.SenderUser)
            .Where(m => m.MessageType == MessageType.System && 
                       m.Subject.Contains("Compliance") && 
                       m.IsUrgent)
            .OrderByDescending(m => m.RegisteredDate)
            .ToListAsync();

        return HandleSuccessResponse(issues);
    }

    private long? GetCurrentUserId()
    {
        var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            return null;

        return 1; // This should be extracted from the JWT token
    }

    private async Task<bool> IsAssessor(long userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.UserRoles.Any(ur => ur.Role.Name == "Assessor") ?? false;
    }
}

public class CustomerApprovalRequest
{
    public bool IsApproved { get; set; }
    public string? Notes { get; set; }
}

public class ServiceReviewRequest
{
    public bool IsApproved { get; set; }
    public string? ReviewNotes { get; set; }
}

public class ComplianceFeedbackRequest
{
    public string Feedback { get; set; } = string.Empty;
}

public class AssessorDashboardResponse
{
    public int PendingCustomerApprovals { get; set; }
    public int PendingServiceReviews { get; set; }
    public int ServicesUnderOversight { get; set; }
    public int CompletedReviewsToday { get; set; }
    public List<Customer> RecentCustomerApprovals { get; set; } = new();
    public List<Service> RecentServiceReviews { get; set; } = new();
}

using Microsoft.AspNetCore.Mvc;
using Transit.Domain.Data;
using Transit.Domain.Models.MOT;
using Transit.Domain.Models.Shared;
using Microsoft.EntityFrameworkCore;
using Transit.Controllers;
using Transit.API.Helpers;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class ServiceController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ServiceController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Get all services with filtering and pagination
    /// </summary>
    [HttpGet("GetAll")]
    public async Task<IActionResult> GetAllServices(
        [FromQuery] ServiceStatus? status = null,
        [FromQuery] ServiceType? serviceType = null,
        [FromQuery] RiskLevel? riskLevel = null,
        [FromQuery] long? customerId = null,
        [FromQuery] long? caseExecutorId = null,
        [FromQuery] long? assessorId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var query = _context.Services
            .Include(s => s.Customer)
            .Include(s => s.AssignedCaseExecutor)
            .Include(s => s.AssignedAssessor)
            .Include(s => s.CreatedByDataEncoder)
            .Include(s => s.Stages)
            .Include(s => s.Documents)
            .AsQueryable();

        // Apply filters
        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (serviceType.HasValue)
            query = query.Where(s => s.ServiceType == serviceType.Value);

        if (riskLevel.HasValue)
            query = query.Where(s => s.RiskLevel == riskLevel.Value);

        if (customerId.HasValue)
            query = query.Where(s => s.CustomerId == customerId.Value);

        if (caseExecutorId.HasValue)
            query = query.Where(s => s.AssignedCaseExecutorId == caseExecutorId.Value);

        if (assessorId.HasValue)
            query = query.Where(s => s.AssignedAssessorId == assessorId.Value);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s => 
                s.ServiceNumber.Contains(search) ||
                s.ItemDescription.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var services = await query
            .OrderByDescending(s => s.RegisteredDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new
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
    /// Get service by ID
    /// </summary>
    [HttpGet("GetById/{id}")]
    public async Task<IActionResult> GetServiceById(long id)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .Include(s => s.Customer)
            .Include(s => s.AssignedCaseExecutor)
            .Include(s => s.AssignedAssessor)
            .Include(s => s.CreatedByDataEncoder)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.StageComments)
            .Include(s => s.Stages)
                .ThenInclude(stage => stage.Documents)
            .Include(s => s.Documents)
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return NotFound("Service not found");

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Create a new service
    /// </summary>
    [HttpPost("Create")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        // Verify customer exists
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId);

        if (customer == null)
            return BadRequest("Customer not found");

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

        // Risk level will be set by the system based on business rules

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        // Create initial service stages based on service type
        await CreateServiceStages(service.Id, request.ServiceType);

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Update service
    /// </summary>
    [HttpPut("Update/{id}")]
    public async Task<IActionResult> UpdateService(long id, [FromBody] UpdateServiceRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return NotFound("Service not found");

        // Update service properties
        service.UpdateDetails(
            request.ItemDescription,
            request.RouteCategory,
            request.DeclaredValue,
            request.TaxCategory,
            request.CountryOfOrigin
        );

        if (request.RiskLevel.HasValue)
        {
            service.SetRiskLevel(request.RiskLevel.Value);
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Delete service
    /// </summary>
    [HttpDelete("Delete/{id}")]
    public async Task<IActionResult> DeleteService(long id)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return NotFound("Service not found");

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return HandleSuccessResponse(new { Message = "Service deleted successfully" });
    }

    /// <summary>
    /// Update service status
    /// </summary>
    [HttpPut("UpdateStatus/{id}")]
    public async Task<IActionResult> UpdateServiceStatus(long id, [FromBody] UpdateServiceStatusRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return NotFound("Service not found");

        service.UpdateStatus(request.Status);

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Assign service to case executor or assessor
    /// </summary>
    [HttpPut("Assign/{id}")]
    public async Task<IActionResult> AssignService(long id, [FromBody] AssignServiceRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return NotFound("Service not found");

        // Verify the assigned user exists and has the correct role
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId);

        if (user == null)
            return NotFound("User not found");

        if (request.Role == "caseExecutor")
        {
            var isCaseExecutor = user.UserRoles.Any(ur => ur.Role.Name == "CaseExecutor");
            if (!isCaseExecutor)
                return BadRequest("User is not a case executor");

            service.AssignCaseExecutor(request.UserId);
        }
        else if (request.Role == "assessor")
        {
            var isAssessor = user.UserRoles.Any(ur => ur.Role.Name == "Assessor");
            if (!isAssessor)
                return BadRequest("User is not an assessor");

            service.AssignAssessor(request.UserId);
        }
        else
        {
            return BadRequest("Invalid role. Must be 'caseExecutor' or 'assessor'");
        }

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(service);
    }

    /// <summary>
    /// Get service stages
    /// </summary>
    [HttpGet("GetStages/{serviceId}")]
    public async Task<IActionResult> GetServiceStages(long serviceId)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var stages = await _context.ServiceStages
            .Include(s => s.StageComments)
            .Include(s => s.Documents)
            .Where(s => s.ServiceId == serviceId)
            .OrderBy(s => s.Stage)
            .ToListAsync();

        return HandleSuccessResponse(stages);
    }

    /// <summary>
    /// Update stage status
    /// </summary>
    [HttpPut("UpdateStageStatus/{stageId}")]
    public async Task<IActionResult> UpdateStageStatus(long stageId, [FromBody] UpdateStageStatusRequest request)
    {
        var currentUserId = JwtHelper.GetCurrentUserId(_httpContextAccessor, _context);
        if (currentUserId == null)
            return Unauthorized("User not authenticated");

        var stage = await _context.ServiceStages
            .FirstOrDefaultAsync(s => s.Id == stageId);

        if (stage == null)
            return NotFound("Service stage not found");

        stage.UpdateStatus(request.Status, currentUserId.Value, request.Comments);

        await _context.SaveChangesAsync();

        return HandleSuccessResponse(stage);
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

// Request/Response DTOs
public class UpdateServiceRequest
{
    public string ItemDescription { get; set; } = string.Empty;
    public string RouteCategory { get; set; } = string.Empty;
    public decimal DeclaredValue { get; set; }
    public string TaxCategory { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
    public RiskLevel? RiskLevel { get; set; }
}

public class UpdateServiceStatusRequest
{
    public ServiceStatus Status { get; set; }
}

public class AssignServiceRequest
{
    public long UserId { get; set; }
    public string Role { get; set; } = string.Empty; // "caseExecutor" or "assessor"
}

public class UpdateStageStatusRequest
{
    public StageStatus Status { get; set; }
    public string? Comments { get; set; }
}

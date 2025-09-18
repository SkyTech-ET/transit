using Microsoft.AspNetCore.Mvc;
using Transit.API.Services;
using Transit.Controllers;
using Transit.Domain.Models.Shared;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class DocumentController : BaseController
{
    private readonly IDocumentService _documentService;

    public DocumentController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost("service/{serviceId}/upload")]
    public async Task<IActionResult> UploadServiceDocument(
        long serviceId,
        [FromForm] IFormFile file,
        [FromForm] DocumentType documentType,
        [FromForm] long? serviceStageId = null,
        [FromForm] string? description = null)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Get current user ID (this should be implemented based on your authentication system)
            var uploadedByUserId = GetCurrentUserId(); // Implement this method

            var document = await _documentService.UploadServiceDocumentAsync(
                serviceId,
                uploadedByUserId,
                file,
                documentType,
                serviceStageId,
                description
            );

            return HandleSuccessResponse(new { Message = "Document uploaded successfully", DocumentId = document.Id });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("stage/{serviceStageId}/upload")]
    public async Task<IActionResult> UploadStageDocument(
        long serviceStageId,
        [FromForm] IFormFile file,
        [FromForm] DocumentType documentType,
        [FromForm] string? description = null)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var uploadedByUserId = GetCurrentUserId();

            var document = await _documentService.UploadStageDocumentAsync(
                serviceStageId,
                uploadedByUserId,
                file,
                documentType,
                description
            );

            return HandleSuccessResponse(new { Message = "Document uploaded successfully", DocumentId = document.Id });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("customer/{customerId}/upload")]
    public async Task<IActionResult> UploadCustomerDocument(
        long customerId,
        [FromForm] IFormFile file,
        [FromForm] DocumentType documentType,
        [FromForm] string? description = null)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var uploadedByUserId = GetCurrentUserId();

            var document = await _documentService.UploadCustomerDocumentAsync(
                customerId,
                uploadedByUserId,
                file,
                documentType,
                description
            );

            return HandleSuccessResponse(new { Message = "Document uploaded successfully", DocumentId = document.Id });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetServiceDocuments(long serviceId)
    {
        try
        {
            var documents = await _documentService.GetServiceDocumentsAsync(serviceId);
            return HandleSuccessResponse(documents);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("stage/{serviceStageId}")]
    public async Task<IActionResult> GetStageDocuments(long serviceStageId)
    {
        try
        {
            var documents = await _documentService.GetStageDocumentsAsync(serviceStageId);
            return HandleSuccessResponse(documents);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetCustomerDocuments(long customerId)
    {
        try
        {
            var documents = await _documentService.GetCustomerDocumentsAsync(customerId);
            return HandleSuccessResponse(documents);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("service-document/{documentId}")]
    public async Task<IActionResult> GetServiceDocument(long documentId)
    {
        try
        {
            var document = await _documentService.GetServiceDocumentAsync(documentId);
            if (document == null)
                return NotFound("Document not found");

            return HandleSuccessResponse(document);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("stage-document/{documentId}")]
    public async Task<IActionResult> GetStageDocument(long documentId)
    {
        try
        {
            var document = await _documentService.GetStageDocumentAsync(documentId);
            if (document == null)
                return NotFound("Document not found");

            return HandleSuccessResponse(document);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("customer-document/{documentId}")]
    public async Task<IActionResult> GetCustomerDocument(long documentId)
    {
        try
        {
            var document = await _documentService.GetCustomerDocumentAsync(documentId);
            if (document == null)
                return NotFound("Document not found");

            return HandleSuccessResponse(document);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpDelete("service-document/{documentId}")]
    public async Task<IActionResult> DeleteServiceDocument(long documentId)
    {
        try
        {
            var result = await _documentService.DeleteServiceDocumentAsync(documentId);
            if (!result)
                return NotFound("Document not found");

            return HandleSuccessResponse(new { Message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpDelete("stage-document/{documentId}")]
    public async Task<IActionResult> DeleteStageDocument(long documentId)
    {
        try
        {
            var result = await _documentService.DeleteStageDocumentAsync(documentId);
            if (!result)
                return NotFound("Document not found");

            return HandleSuccessResponse(new { Message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpDelete("customer-document/{documentId}")]
    public async Task<IActionResult> DeleteCustomerDocument(long documentId)
    {
        try
        {
            var result = await _documentService.DeleteCustomerDocumentAsync(documentId);
            if (!result)
                return NotFound("Document not found");

            return HandleSuccessResponse(new { Message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("verify/{documentId}")]
    public async Task<IActionResult> VerifyDocument(long documentId, [FromBody] VerifyDocumentRequest request)
    {
        try
        {
            var result = await _documentService.VerifyDocumentAsync(documentId, request.IsVerified, request.VerificationNotes);
            if (!result)
                return NotFound("Document not found");

            return HandleSuccessResponse(new { Message = "Document verification updated successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("download/{documentId}/{category}")]
    public async Task<IActionResult> DownloadDocument(long documentId, DocumentCategory category)
    {
        try
        {
            var filePath = await _documentService.GetDocumentPathAsync(documentId, category);
            if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                return NotFound("Document not found");

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var fileName = Path.GetFileName(filePath);

            return base.File(fileBytes, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    private long GetCurrentUserId()
    {
        // This is a placeholder. In a real application, you would get the user ID from the JWT token.
        // For now, returning a dummy ID or throwing an exception.
        // Example: var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        // return userIdClaim != null ? long.Parse(userIdClaim.Value) : 0;
        return 1; // Dummy user ID for testing
    }
}

public class VerifyDocumentRequest
{
    public bool IsVerified { get; set; }
    public string? VerificationNotes { get; set; }
}

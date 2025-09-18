using Microsoft.AspNetCore.Mvc;
using Transit.API.Services;
using Transit.Controllers;
using Transit.Domain.Models.Shared;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class MessagingController : BaseController
{
    private readonly IMessagingService _messagingService;

    public MessagingController(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var message = await _messagingService.SendMessageAsync(
                request.ServiceId,
                request.SenderId,
                request.Subject,
                request.Content,
                request.Type,
                request.RecipientId
            );

            return HandleSuccessResponse(new { Message = "Message sent successfully", MessageId = message.Id });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetServiceMessages(long serviceId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var messages = await _messagingService.GetServiceMessagesAsync(serviceId, page, pageSize);
            return HandleSuccessResponse(messages);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserMessages(long userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var messages = await _messagingService.GetUserMessagesAsync(userId, page, pageSize);
            return HandleSuccessResponse(messages);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("{messageId}")]
    public async Task<IActionResult> GetMessage(long messageId)
    {
        try
        {
            var message = await _messagingService.GetMessageAsync(messageId);
            if (message == null)
                return NotFound("Message not found");

            return HandleSuccessResponse(message);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("mark-read/{messageId}/{userId}")]
    public async Task<IActionResult> MarkAsRead(long messageId, long userId)
    {
        try
        {
            await _messagingService.MarkMessageAsReadAsync(messageId, userId);
            return HandleSuccessResponse(new { Message = "Message marked as read" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("unread/{userId}")]
    public async Task<IActionResult> GetUnreadMessages(long userId)
    {
        try
        {
            var messages = await _messagingService.GetUnreadMessagesAsync(userId);
            return HandleSuccessResponse(messages);
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpGet("unread-count/{userId}")]
    public async Task<IActionResult> GetUnreadCount(long userId)
    {
        try
        {
            var count = await _messagingService.GetUnreadMessageCountAsync(userId);
            return HandleSuccessResponse(new { UnreadCount = count });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("group")]
    public async Task<IActionResult> SendGroupMessage([FromBody] SendGroupMessageRequest request)
    {
        try
        {
            await _messagingService.SendGroupMessageAsync(
                request.ServiceId,
                request.SenderId,
                request.Subject,
                request.Content,
                request.RecipientIds
            );

            return HandleSuccessResponse(new { Message = "Group message sent successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }
}

public class SendMessageRequest
{
    public long ServiceId { get; set; }
    public long SenderId { get; set; }
    public long? RecipientId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; }
}

public class SendGroupMessageRequest
{
    public long ServiceId { get; set; }
    public long SenderId { get; set; }
    public List<long> RecipientIds { get; set; } = new();
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

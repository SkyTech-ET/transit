using Microsoft.AspNetCore.Mvc;
using Transit.API.Services;
using Transit.Controllers;
using Transit.Domain.Models.Shared;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class NotificationController : BaseController
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserNotifications(long userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var notifications = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
            var unreadCount = await _notificationService.GetUnreadNotificationCountAsync(userId);

            var response = new
            {
                Notifications = notifications,
                UnreadCount = unreadCount,
                Page = page,
                PageSize = pageSize
            };

            return HandleSuccessResponse(response);
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
            var count = await _notificationService.GetUnreadNotificationCountAsync(userId);
            return HandleSuccessResponse(new { UnreadCount = count });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("mark-read/{notificationId}")]
    public async Task<IActionResult> MarkAsRead(long notificationId)
    {
        try
        {
            await _notificationService.MarkNotificationAsReadAsync(notificationId);
            return HandleSuccessResponse(new { Message = "Notification marked as read" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("mark-all-read/{userId}")]
    public async Task<IActionResult> MarkAllAsRead(long userId)
    {
        try
        {
            await _notificationService.MarkAllNotificationsAsReadAsync(userId);
            return HandleSuccessResponse(new { Message = "All notifications marked as read" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
    {
        try
        {
            await _notificationService.CreateNotificationAsync(
                request.UserId,
                request.Title,
                request.Message,
                request.Type,
                request.ServiceId
            );

            return HandleSuccessResponse(new { Message = "Notification created successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> SendBulkNotification([FromBody] BulkNotificationRequest request)
    {
        try
        {
            await _notificationService.SendBulkNotificationAsync(
                request.UserIds,
                request.Title,
                request.Message,
                request.Type
            );

            return HandleSuccessResponse(new { Message = "Bulk notification sent successfully" });
        }
        catch (Exception ex)
        {
            return HandleErrorResponse(ex);
        }
    }
}

public class CreateNotificationRequest
{
    public long UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public long? ServiceId { get; set; }
}

public class BulkNotificationRequest
{
    public List<long> UserIds { get; set; } = new();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
}

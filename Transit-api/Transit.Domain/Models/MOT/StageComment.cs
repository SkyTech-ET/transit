namespace Transit.Domain.Models.MOT;

public class StageComment : BaseEntity
{
    public string Comment { get; private set; } = string.Empty;
    public string? CommentType { get; private set; }
    public bool IsInternal { get; private set; }
    public bool IsVisibleToCustomer { get; private set; }

    // Foreign Keys
    public long ServiceStageId { get; private set; }
    public long CommentedByUserId { get; private set; }

    // Navigation Properties
    public ServiceStageExecution ServiceStage { get; set; }
    public User CommentedByUser { get; set; }

    public static StageComment Create(
        string comment,
        long serviceStageId,
        long commentedByUserId,
        string? commentType = null,
        bool isInternal = false,
        bool isVisibleToCustomer = true)
    {
        return new StageComment
        {
            Comment = comment,
            ServiceStageId = serviceStageId,
            CommentedByUserId = commentedByUserId,
            CommentType = commentType,
            IsInternal = isInternal,
            IsVisibleToCustomer = isVisibleToCustomer,
            RecordStatus = RecordStatus.Active
        };
    }

    public void UpdateComment(string comment)
    {
        Comment = comment;
        UpdateAudit("System");
    }

    public void SetVisibility(bool isVisibleToCustomer)
    {
        IsVisibleToCustomer = isVisibleToCustomer;
        UpdateAudit("System");
    }
}

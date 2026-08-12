using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionManagement.API.Models
{
    public class CreateSubmissionRequest
    {
        [Required]
        public int AssignmentId { get; set; }

        [Required]
        public string Answer { get; set; } = string.Empty;
    }

    public class UpdateSubmissionRequest
    {
        [Required]
        public string Answer { get; set; } = string.Empty;
    }

    public class ReviewSubmissionRequest
    {
        [Required]
        [Range(0, 1000)]
        public int Marks { get; set; }

        public string? Feedback { get; set; }

        [Required]
        public string Status { get; set; } = "Reviewed";
    }
}
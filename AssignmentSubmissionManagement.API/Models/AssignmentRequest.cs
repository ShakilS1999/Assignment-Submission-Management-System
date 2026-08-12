using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionManagement.API.Models
{
    public class AssignmentRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int ClassRoomId { get; set; }

        [Required]
        public int SubjectId { get; set; }

        [Required]
        public DateTime Deadline { get; set; }

        [Range(1, 1000)]
        public int MaximumMarks { get; set; }

        public bool IsPublished { get; set; } = false;

        public bool AllowSubmissionUpdate { get; set; } = true;
    }
}
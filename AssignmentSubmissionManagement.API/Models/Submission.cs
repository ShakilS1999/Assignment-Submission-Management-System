using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentSubmissionManagement.API.Models
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssignmentId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public string Answer { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Submitted";

        public int? Marks { get; set; }

        public string? Feedback { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(AssignmentId))]
        public Assignment? Assignment { get; set; }

        [ForeignKey(nameof(StudentId))]
        public User? Student { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentSubmissionManagement.API.Models
{
    public class Assignment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime Deadline { get; set; }

        [Required]
        [Range(1, 1000)]
        public int MaximumMarks { get; set; }

        // Draft = false, Published = true
        public bool IsPublished { get; set; } = false;

        // Student deadline-এর আগে submission edit করতে পারবে কি না
        public bool AllowSubmissionUpdate { get; set; } = true;

        [Required]
        public int TeacherId { get; set; }

        [Required]
        public int ClassRoomId { get; set; }

        [Required]
        public int SubjectId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(TeacherId))]
        public User? Teacher { get; set; }

        [ForeignKey(nameof(ClassRoomId))]
        public ClassRoom? ClassRoom { get; set; }

        [ForeignKey(nameof(SubjectId))]
        public Subject? Subject { get; set; }
    }
}
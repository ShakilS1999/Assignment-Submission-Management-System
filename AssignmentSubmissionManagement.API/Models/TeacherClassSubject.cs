using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentSubmissionManagement.API.Models
{
    public class TeacherClassSubject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TeacherId { get; set; }

        [Required]
        public int ClassRoomId { get; set; }

        [Required]
        public int SubjectId { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(TeacherId))]
        public User? Teacher { get; set; }

        [ForeignKey(nameof(ClassRoomId))]
        public ClassRoom? ClassRoom { get; set; }

        [ForeignKey(nameof(SubjectId))]
        public Subject? Subject { get; set; }
    }
}
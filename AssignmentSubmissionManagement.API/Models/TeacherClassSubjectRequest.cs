using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionManagement.API.Models
{
    public class TeacherClassSubjectRequest
    {
        [Required]
        public int TeacherId { get; set; }

        [Required]
        public int ClassRoomId { get; set; }

        [Required]
        public int SubjectId { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionManagement.API.Models
{
    public class StudentEnrollmentRequest
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int ClassRoomId { get; set; }
    }
}
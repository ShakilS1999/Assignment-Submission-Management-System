using AssignmentSubmissionManagement.API.Data;
using AssignmentSubmissionManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StudentEnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StudentEnrollmentsController> _logger;

        public StudentEnrollmentsController(
            ApplicationDbContext context,
            ILogger<StudentEnrollmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/StudentEnrollments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var enrollments = await _context.StudentEnrollments
                .AsNoTracking()
                .Include(x => x.Student)
                .Include(x => x.ClassRoom)
                .Select(x => new
                {
                    x.Id,

                    StudentId = x.StudentId,
                    StudentName = x.Student!.FullName,
                    StudentEmail = x.Student.Email,

                    ClassRoomId = x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    x.IsActive,
                    x.EnrolledAt
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // GET: api/StudentEnrollments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var enrollment = await _context.StudentEnrollments
                .AsNoTracking()
                .Include(x => x.Student)
                .Include(x => x.ClassRoom)
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,

                    StudentId = x.StudentId,
                    StudentName = x.Student!.FullName,
                    StudentEmail = x.Student.Email,

                    ClassRoomId = x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    x.IsActive,
                    x.EnrolledAt
                })
                .FirstOrDefaultAsync();

            if (enrollment == null)
            {
                return NotFound(new
                {
                    message = "Student enrollment not found."
                });
            }

            return Ok(enrollment);
        }

        // POST: api/StudentEnrollments
        [HttpPost]
        public async Task<IActionResult> Create(
            StudentEnrollmentRequest request)
        {
            // Student check
            var student = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == request.StudentId &&
                    x.Role == "Student" &&
                    x.IsActive);

            if (student == null)
            {
                return BadRequest(new
                {
                    message = "Valid active student not found."
                });
            }

            // Class/Course check
            var classRoom = await _context.ClassRooms
                .FirstOrDefaultAsync(x =>
                    x.Id == request.ClassRoomId &&
                    x.IsActive);

            if (classRoom == null)
            {
                return BadRequest(new
                {
                    message = "Valid active class/course not found."
                });
            }

            // Duplicate check
            var exists = await _context.StudentEnrollments
                .AnyAsync(x =>
                    x.StudentId == request.StudentId &&
                    x.ClassRoomId == request.ClassRoomId);

            if (exists)
            {
                return BadRequest(new
                {
                    message =
                        "Student is already enrolled in this class/course."
                });
            }

            var enrollment = new StudentEnrollment
            {
                StudentId = request.StudentId,
                ClassRoomId = request.ClassRoomId,
                IsActive = true,
                EnrolledAt = DateTime.UtcNow
            };

            _context.StudentEnrollments.Add(enrollment);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Student {StudentId} enrolled in Class/Course {ClassRoomId}.",
                request.StudentId,
                request.ClassRoomId
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = enrollment.Id },
                new
                {
                    enrollment.Id,
                    enrollment.StudentId,
                    enrollment.ClassRoomId,
                    enrollment.IsActive,
                    enrollment.EnrolledAt
                });
        }

        // PATCH: api/StudentEnrollments/5/status?isActive=false
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromQuery] bool isActive)
        {
            var enrollment = await _context.StudentEnrollments
                .FindAsync(id);

            if (enrollment == null)
            {
                return NotFound(new
                {
                    message = "Student enrollment not found."
                });
            }

            enrollment.IsActive = isActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = isActive
                    ? "Student enrollment activated successfully."
                    : "Student enrollment deactivated successfully."
            });
        }
    }
}
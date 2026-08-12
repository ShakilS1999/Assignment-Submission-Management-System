using AssignmentSubmissionManagement.API.Data;
using AssignmentSubmissionManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentSubmissionManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AssignmentsController> _logger;

        public AssignmentsController(
            ApplicationDbContext context,
            ILogger<AssignmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =====================================================
        // ADMIN - View all assignments
        // GET: api/Assignments/all
        // =====================================================
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var assignments = await _context.Assignments
                .AsNoTracking()
                .Include(x => x.Teacher)
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Description,
                    x.Deadline,
                    x.MaximumMarks,
                    x.IsPublished,
                    x.AllowSubmissionUpdate,

                    x.TeacherId,
                    TeacherName = x.Teacher!.FullName,

                    x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    x.SubjectId,
                    SubjectName = x.Subject!.Name,

                    x.CreatedAt,
                    x.UpdatedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // =====================================================
        // TEACHER - View own assignments
        // GET: api/Assignments/my
        // =====================================================
        [HttpGet("my")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var teacherId = GetCurrentUserId();

            var assignments = await _context.Assignments
                .AsNoTracking()
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .Where(x => x.TeacherId == teacherId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Description,
                    x.Deadline,
                    x.MaximumMarks,
                    x.IsPublished,
                    x.AllowSubmissionUpdate,

                    x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    x.SubjectId,
                    SubjectName = x.Subject!.Name,

                    x.CreatedAt,
                    x.UpdatedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // =====================================================
        // STUDENT - View published assignments for own class
        // GET: api/Assignments/student
        // =====================================================
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentAssignments()
        {
            var studentId = GetCurrentUserId();

            var classIds = await _context.StudentEnrollments
                .Where(x =>
                    x.StudentId == studentId &&
                    x.IsActive)
                .Select(x => x.ClassRoomId)
                .ToListAsync();

            var assignments = await _context.Assignments
                .AsNoTracking()
                .Include(x => x.Teacher)
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .Where(x =>
                    classIds.Contains(x.ClassRoomId) &&
                    x.IsPublished)
                .OrderBy(x => x.Deadline)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Description,
                    x.Deadline,
                    x.MaximumMarks,

                    TeacherName = x.Teacher!.FullName,
                    ClassRoomName = x.ClassRoom!.Name,
                    SubjectName = x.Subject!.Name,

                    x.AllowSubmissionUpdate
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // =====================================================
        // GET Assignment Details
        // GET: api/Assignments/5
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var assignment = await _context.Assignments
                .AsNoTracking()
                .Include(x => x.Teacher)
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Assignment not found."
                });
            }

            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = GetCurrentUserId();

            // Teacher can only view own assignment
            if (role == "Teacher" &&
                assignment.TeacherId != userId)
            {
                return Forbid();
            }

            // Student can only view a published assignment
            // belonging to their class/course
            if (role == "Student")
            {
                if (!assignment.IsPublished)
                {
                    return Forbid();
                }

                var enrolled = await _context.StudentEnrollments
                    .AnyAsync(x =>
                        x.StudentId == userId &&
                        x.ClassRoomId == assignment.ClassRoomId &&
                        x.IsActive);

                if (!enrolled)
                {
                    return Forbid();
                }
            }

            return Ok(new
            {
                assignment.Id,
                assignment.Title,
                assignment.Description,
                assignment.Deadline,
                assignment.MaximumMarks,
                assignment.IsPublished,
                assignment.AllowSubmissionUpdate,

                assignment.TeacherId,
                TeacherName = assignment.Teacher!.FullName,

                assignment.ClassRoomId,
                ClassRoomName = assignment.ClassRoom!.Name,

                assignment.SubjectId,
                SubjectName = assignment.Subject!.Name,

                assignment.CreatedAt,
                assignment.UpdatedAt
            });
        }

        // =====================================================
        // TEACHER - Create assignment
        // POST: api/Assignments
        // =====================================================
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Create(
            AssignmentRequest request)
        {
            var teacherId = GetCurrentUserId();

            if (request.Deadline <= DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "Deadline must be in the future."
                });
            }

            // Teacher must be assigned to this Class + Subject
            var teacherAssigned =
                await _context.TeacherClassSubjects
                    .AnyAsync(x =>
                        x.TeacherId == teacherId &&
                        x.ClassRoomId == request.ClassRoomId &&
                        x.SubjectId == request.SubjectId);

            if (!teacherAssigned)
            {
                return BadRequest(new
                {
                    message =
                        "You are not assigned to this class/course and subject."
                });
            }

            var assignment = new Assignment
            {
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Deadline = request.Deadline,
                MaximumMarks = request.MaximumMarks,

                IsPublished = request.IsPublished,

                AllowSubmissionUpdate =
                    request.AllowSubmissionUpdate,

                TeacherId = teacherId,
                ClassRoomId = request.ClassRoomId,
                SubjectId = request.SubjectId,

                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Teacher {TeacherId} created Assignment {AssignmentId}.",
                teacherId,
                assignment.Id
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = assignment.Id },
                new
                {
                    assignment.Id,
                    assignment.Title,
                    assignment.IsPublished
                });
        }

        // =====================================================
        // TEACHER - Update own assignment
        // PUT: api/Assignments/5
        // =====================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Update(
            int id,
            AssignmentRequest request)
        {
            var teacherId = GetCurrentUserId();

            var assignment =
                await _context.Assignments.FindAsync(id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Assignment not found."
                });
            }

            if (assignment.TeacherId != teacherId)
            {
                return Forbid();
            }

            if (request.Deadline <= DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "Deadline must be in the future."
                });
            }

            var teacherAssigned =
                await _context.TeacherClassSubjects
                    .AnyAsync(x =>
                        x.TeacherId == teacherId &&
                        x.ClassRoomId == request.ClassRoomId &&
                        x.SubjectId == request.SubjectId);

            if (!teacherAssigned)
            {
                return BadRequest(new
                {
                    message =
                        "You are not assigned to this class/course and subject."
                });
            }

            assignment.Title = request.Title.Trim();
            assignment.Description =
                request.Description.Trim();

            assignment.ClassRoomId =
                request.ClassRoomId;

            assignment.SubjectId =
                request.SubjectId;

            assignment.Deadline =
                request.Deadline;

            assignment.MaximumMarks =
                request.MaximumMarks;

            assignment.IsPublished =
                request.IsPublished;

            assignment.AllowSubmissionUpdate =
                request.AllowSubmissionUpdate;

            assignment.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Assignment updated successfully."
            });
        }

        // =====================================================
        // TEACHER - Delete own assignment
        // DELETE: api/Assignments/5
        // =====================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var teacherId = GetCurrentUserId();

            var assignment =
                await _context.Assignments.FindAsync(id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Assignment not found."
                });
            }

            if (assignment.TeacherId != teacherId)
            {
                return Forbid();
            }

            var hasSubmissions =
                await _context.Submissions
                    .AnyAsync(x =>
                        x.AssignmentId == id);

            if (hasSubmissions)
            {
                return BadRequest(new
                {
                    message =
                        "Assignment cannot be deleted because submissions already exist."
                });
            }

            _context.Assignments.Remove(assignment);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Assignment deleted successfully."
            });
        }

        // =====================================================
        // Helper - Get logged-in User Id from JWT
        // =====================================================
        private int GetCurrentUserId()
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            return int.Parse(userId!);
        }
    }
}
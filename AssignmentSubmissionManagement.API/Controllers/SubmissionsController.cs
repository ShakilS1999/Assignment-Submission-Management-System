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
    public class SubmissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubmissionsController> _logger;

        public SubmissionsController(
            ApplicationDbContext context,
            ILogger<SubmissionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =====================================================
        // ADMIN - View all submissions
        // GET: api/Submissions/all
        // =====================================================
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var submissions = await _context.Submissions
                .AsNoTracking()
                .Include(x => x.Assignment)
                .Include(x => x.Student)
                .OrderByDescending(x => x.SubmittedAt)
                .Select(x => new
                {
                    x.Id,
                    x.AssignmentId,
                    AssignmentTitle = x.Assignment!.Title,

                    x.StudentId,
                    StudentName = x.Student!.FullName,
                    StudentEmail = x.Student.Email,

                    x.Answer,
                    x.Status,
                    x.Marks,
                    x.Feedback,
                    x.SubmittedAt,
                    x.UpdatedAt,
                    x.ReviewedAt
                })
                .ToListAsync();

            return Ok(submissions);
        }

        // =====================================================
        // STUDENT - View own submissions
        // GET: api/Submissions/my
        // =====================================================
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMySubmissions()
        {
            var studentId = GetCurrentUserId();

            var submissions = await _context.Submissions
                .AsNoTracking()
                .Include(x => x.Assignment)
                .Where(x => x.StudentId == studentId)
                .OrderByDescending(x => x.SubmittedAt)
                .Select(x => new
                {
                    x.Id,

                    x.AssignmentId,
                    AssignmentTitle = x.Assignment!.Title,

                    x.Answer,
                    x.Status,
                    x.Marks,
                    x.Feedback,

                    AssignmentDeadline =
                        x.Assignment.Deadline,

                    MaximumMarks =
                        x.Assignment.MaximumMarks,

                    x.SubmittedAt,
                    x.UpdatedAt,
                    x.ReviewedAt
                })
                .ToListAsync();

            return Ok(submissions);
        }

        // =====================================================
        // TEACHER - View submissions of own assignment
        // GET: api/Submissions/assignment/5
        // =====================================================
        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAssignmentSubmissions(
            int assignmentId)
        {
            var teacherId = GetCurrentUserId();

            var assignment = await _context.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == assignmentId);

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

            var submissions = await _context.Submissions
                .AsNoTracking()
                .Include(x => x.Student)
                .Where(x =>
                    x.AssignmentId == assignmentId)
                .OrderBy(x => x.Student!.FullName)
                .Select(x => new
                {
                    x.Id,
                    x.StudentId,

                    StudentName =
                        x.Student!.FullName,

                    StudentEmail =
                        x.Student.Email,

                    x.Answer,
                    x.Status,
                    x.Marks,
                    x.Feedback,
                    x.SubmittedAt,
                    x.UpdatedAt,
                    x.ReviewedAt
                })
                .ToListAsync();

            return Ok(submissions);
        }

        // =====================================================
        // STUDENT - Submit assignment
        // POST: api/Submissions
        // =====================================================
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Create(
            CreateSubmissionRequest request)
        {
            var studentId = GetCurrentUserId();

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(x =>
                    x.Id == request.AssignmentId);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Assignment not found."
                });
            }

            // Student cannot submit a draft assignment
            if (!assignment.IsPublished)
            {
                return BadRequest(new
                {
                    message =
                        "This assignment is not published."
                });
            }

            // Deadline check
            if (DateTime.UtcNow > assignment.Deadline)
            {
                return BadRequest(new
                {
                    message =
                        "The submission deadline has passed."
                });
            }

            // Student must belong to assignment's class/course
            var enrolled = await _context.StudentEnrollments
                .AnyAsync(x =>
                    x.StudentId == studentId &&
                    x.ClassRoomId == assignment.ClassRoomId &&
                    x.IsActive);

            if (!enrolled)
            {
                return Forbid();
            }

            // One submission per student per assignment
            var alreadySubmitted =
                await _context.Submissions.AnyAsync(x =>
                    x.AssignmentId == request.AssignmentId &&
                    x.StudentId == studentId);

            if (alreadySubmitted)
            {
                return BadRequest(new
                {
                    message =
                        "You have already submitted this assignment."
                });
            }

            var submission = new Submission
            {
                AssignmentId = request.AssignmentId,
                StudentId = studentId,
                Answer = request.Answer.Trim(),
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };

            _context.Submissions.Add(submission);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Student {StudentId} submitted Assignment {AssignmentId}.",
                studentId,
                assignment.Id
            );

            return CreatedAtAction(
                nameof(GetMySubmissions),
                new
                {
                    id = submission.Id
                },
                new
                {
                    submission.Id,
                    submission.AssignmentId,
                    submission.Status,
                    submission.SubmittedAt
                });
        }

        // =====================================================
        // STUDENT - Update own submission
        // PUT: api/Submissions/5
        // =====================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Update(
            int id,
            UpdateSubmissionRequest request)
        {
            var studentId = GetCurrentUserId();

            var submission = await _context.Submissions
                .Include(x => x.Assignment)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (submission == null)
            {
                return NotFound(new
                {
                    message = "Submission not found."
                });
            }

            if (submission.StudentId != studentId)
            {
                return Forbid();
            }

            if (DateTime.UtcNow >
                submission.Assignment!.Deadline)
            {
                return BadRequest(new
                {
                    message =
                        "The submission deadline has passed."
                });
            }

            if (!submission.Assignment.AllowSubmissionUpdate)
            {
                return BadRequest(new
                {
                    message =
                        "Updating this submission is not allowed."
                });
            }

            submission.Answer = request.Answer.Trim();
            submission.UpdatedAt = DateTime.UtcNow;

            // Our project assumption:
            // An edited submission goes back to Submitted status.
            submission.Status = "Submitted";
            submission.Marks = null;
            submission.Feedback = null;
            submission.ReviewedAt = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Student {StudentId} updated Submission {SubmissionId}.",
                studentId,
                submission.Id
            );

            return Ok(new
            {
                message =
                    "Submission updated successfully."
            });
        }

        // =====================================================
        // TEACHER - Review, mark and change status
        // PUT: api/Submissions/5/review
        // =====================================================
        [HttpPut("{id}/review")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Review(
            int id,
            ReviewSubmissionRequest request)
        {
            var teacherId = GetCurrentUserId();

            var submission = await _context.Submissions
                .Include(x => x.Assignment)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (submission == null)
            {
                return NotFound(new
                {
                    message = "Submission not found."
                });
            }

            // Teacher may review only their own assignment
            if (submission.Assignment!.TeacherId != teacherId)
            {
                return Forbid();
            }

            // Marks cannot exceed MaximumMarks
            if (request.Marks >
                submission.Assignment.MaximumMarks)
            {
                return BadRequest(new
                {
                    message =
                        $"Marks cannot exceed maximum marks ({submission.Assignment.MaximumMarks})."
                });
            }

            var allowedStatuses = new[]
            {
                "Submitted",
                "Reviewed",
                "NeedsRevision"
            };

            if (!allowedStatuses.Contains(
                request.Status,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "Status must be Submitted, Reviewed or NeedsRevision."
                });
            }

            var normalizedStatus =
                allowedStatuses.First(x =>
                    x.Equals(
                        request.Status,
                        StringComparison.OrdinalIgnoreCase));

            submission.Marks = request.Marks;
            submission.Feedback =
                request.Feedback?.Trim();

            submission.Status = normalizedStatus;
            submission.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Teacher {TeacherId} reviewed Submission {SubmissionId}.",
                teacherId,
                submission.Id
            );

            return Ok(new
            {
                message =
                    "Submission reviewed successfully.",

                submission.Id,
                submission.Status,
                submission.Marks,
                submission.Feedback,
                submission.ReviewedAt
            });
        }

        // =====================================================
        // Helper - Logged-in User Id
        // =====================================================
        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            return int.Parse(userId!);
        }
    }
}
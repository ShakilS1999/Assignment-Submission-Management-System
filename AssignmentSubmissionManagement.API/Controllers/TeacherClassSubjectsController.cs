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
    public class TeacherClassSubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TeacherClassSubjectsController> _logger;

        public TeacherClassSubjectsController(
            ApplicationDbContext context,
            ILogger<TeacherClassSubjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =====================================================
        // ADMIN - View all Teacher/Class/Subject assignments
        // GET: api/TeacherClassSubjects
        // =====================================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var assignments = await _context.TeacherClassSubjects
                .AsNoTracking()
                .Include(x => x.Teacher)
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .Select(x => new
                {
                    x.Id,

                    TeacherId = x.TeacherId,
                    TeacherName = x.Teacher!.FullName,

                    ClassRoomId = x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    SubjectId = x.SubjectId,
                    SubjectName = x.Subject!.Name,

                    x.AssignedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // =====================================================
        // TEACHER - View own assigned Class + Subject
        // GET: api/TeacherClassSubjects/my
        // =====================================================
        [HttpGet("my")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var teacherId = GetCurrentUserId();

            var assignments = await _context.TeacherClassSubjects
                .AsNoTracking()
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .Where(x => x.TeacherId == teacherId)
                .OrderBy(x => x.ClassRoom!.Name)
                .ThenBy(x => x.Subject!.Name)
                .Select(x => new
                {
                    x.Id,

                    x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    x.SubjectId,
                    SubjectName = x.Subject!.Name,

                    x.AssignedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // =====================================================
        // ADMIN - View assignment by ID
        // GET: api/TeacherClassSubjects/5
        // =====================================================
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var assignment = await _context.TeacherClassSubjects
                .AsNoTracking()
                .Include(x => x.Teacher)
                .Include(x => x.ClassRoom)
                .Include(x => x.Subject)
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,

                    TeacherId = x.TeacherId,
                    TeacherName = x.Teacher!.FullName,

                    ClassRoomId = x.ClassRoomId,
                    ClassRoomName = x.ClassRoom!.Name,

                    SubjectId = x.SubjectId,
                    SubjectName = x.Subject!.Name,

                    x.AssignedAt
                })
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Teacher assignment not found."
                });
            }

            return Ok(assignment);
        }

        // =====================================================
        // ADMIN - Assign Teacher to Class + Subject
        // POST: api/TeacherClassSubjects
        // =====================================================
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            TeacherClassSubjectRequest request)
        {
            // Teacher check
            var teacher = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == request.TeacherId &&
                    x.Role == "Teacher" &&
                    x.IsActive);

            if (teacher == null)
            {
                return BadRequest(new
                {
                    message = "Valid active teacher not found."
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

            // Subject check
            var subject = await _context.Subjects
                .FirstOrDefaultAsync(x =>
                    x.Id == request.SubjectId &&
                    x.IsActive);

            if (subject == null)
            {
                return BadRequest(new
                {
                    message = "Valid active subject not found."
                });
            }

            // Duplicate check
            var exists = await _context.TeacherClassSubjects
                .AnyAsync(x =>
                    x.TeacherId == request.TeacherId &&
                    x.ClassRoomId == request.ClassRoomId &&
                    x.SubjectId == request.SubjectId);

            if (exists)
            {
                return BadRequest(new
                {
                    message =
                        "Teacher is already assigned to this class and subject."
                });
            }

            var teacherAssignment = new TeacherClassSubject
            {
                TeacherId = request.TeacherId,
                ClassRoomId = request.ClassRoomId,
                SubjectId = request.SubjectId,
                AssignedAt = DateTime.UtcNow
            };

            _context.TeacherClassSubjects.Add(
                teacherAssignment
            );

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Teacher {TeacherId} assigned to Class {ClassRoomId} and Subject {SubjectId}.",
                request.TeacherId,
                request.ClassRoomId,
                request.SubjectId
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = teacherAssignment.Id },
                new
                {
                    teacherAssignment.Id,
                    teacherAssignment.TeacherId,
                    teacherAssignment.ClassRoomId,
                    teacherAssignment.SubjectId,
                    teacherAssignment.AssignedAt
                });
        }

        // =====================================================
        // ADMIN - Remove Teacher/Class/Subject assignment
        // DELETE: api/TeacherClassSubjects/5
        // =====================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var assignment =
                await _context.TeacherClassSubjects
                    .FindAsync(id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "Teacher assignment not found."
                });
            }

            _context.TeacherClassSubjects.Remove(
                assignment
            );

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Teacher assignment {AssignmentId} removed.",
                id
            );

            return Ok(new
            {
                message =
                    "Teacher assignment removed successfully."
            });
        }

        // =====================================================
        // Helper - Logged-in User ID from JWT
        // =====================================================
        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            return int.Parse(userId!);
        }
    }
}
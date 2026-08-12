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
    public class SubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(
            ApplicationDbContext context,
            ILogger<SubjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Subjects
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var subjects = await _context.Subjects
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();

            return Ok(subjects);
        }

        // GET: api/Subjects/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var subject = await _context.Subjects
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (subject == null)
            {
                return NotFound(new
                {
                    message = "Subject not found."
                });
            }

            return Ok(subject);
        }

        // POST: api/Subjects
        [HttpPost]
        public async Task<IActionResult> Create(
            SubjectRequest request)
        {
            var normalizedCode =
    string.IsNullOrWhiteSpace(request.Code)
        ? null
        : request.Code.Trim();

            if (normalizedCode != null)
            {
                var codeExists = await _context.Subjects
                    .AnyAsync(x => x.Code == normalizedCode);

                if (codeExists)
                {
                    return BadRequest(new
                    {
                        message = "Subject code already exists."
                    });
                }
            }

            var subject = new Subject
            {
                Name = request.Name.Trim(),
                Code = normalizedCode,
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Subjects.Add(subject);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Subject {SubjectId} created.",
                subject.Id
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = subject.Id },
                subject
            );
        }

        // PUT: api/Subjects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SubjectRequest request)
        {
            var subject = await _context.Subjects
                .FindAsync(id);

            if (subject == null)
            {
                return NotFound(new
                {
                    message = "Subject not found."
                });
            }

            var normalizedCode =
    string.IsNullOrWhiteSpace(request.Code)
        ? null
        : request.Code.Trim();

            if (normalizedCode != null)
            {
                var codeExists = await _context.Subjects
                    .AnyAsync(x =>
                        x.Code == normalizedCode &&
                        x.Id != id);

                if (codeExists)
                {
                    return BadRequest(new
                    {
                        message = "Subject code already exists."
                    });
                }
            }

            subject.Name = request.Name.Trim();
            subject.Code = normalizedCode;
            subject.Description = request.Description?.Trim();
            subject.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Subject {SubjectId} updated.",
                subject.Id
            );

            return Ok(new
            {
                message = "Subject updated successfully."
            });
        }

        // PATCH: api/Subjects/5/status?isActive=false
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromQuery] bool isActive)
        {
            var subject = await _context.Subjects
                .FindAsync(id);

            if (subject == null)
            {
                return NotFound(new
                {
                    message = "Subject not found."
                });
            }

            subject.IsActive = isActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = isActive
                    ? "Subject activated successfully."
                    : "Subject deactivated successfully."
            });
        }
    }
}
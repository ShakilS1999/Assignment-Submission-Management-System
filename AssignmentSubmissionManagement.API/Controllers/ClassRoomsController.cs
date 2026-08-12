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
    public class ClassRoomsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClassRoomsController> _logger;

        public ClassRoomsController(
            ApplicationDbContext context,
            ILogger<ClassRoomsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ClassRooms
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var classRooms = await _context.ClassRooms
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();

            return Ok(classRooms);
        }

        // GET: api/ClassRooms/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var classRoom = await _context.ClassRooms
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (classRoom == null)
            {
                return NotFound(new
                {
                    message = "Class/Course not found."
                });
            }

            return Ok(classRoom);
        }

        // POST: api/ClassRooms
        [HttpPost]
        public async Task<IActionResult> Create(
            ClassroomRequest request)
        {
            var normalizedCode =
    string.IsNullOrWhiteSpace(request.Code)
        ? null
        : request.Code.Trim();

            if (normalizedCode != null)
            {
                var codeExists = await _context.ClassRooms
                    .AnyAsync(x => x.Code == normalizedCode);

                if (codeExists)
                {
                    return BadRequest(new
                    {
                        message = "Class/Course code already exists."
                    });
                }
            }

            var classRoom = new ClassRoom
            {
                Name = request.Name.Trim(),
                Code = normalizedCode,
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.ClassRooms.Add(classRoom);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Class/Course {ClassRoomId} created.",
                classRoom.Id
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = classRoom.Id },
                classRoom
            );
        }

        // PUT: api/ClassRooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            ClassroomRequest request)
        {
            var classRoom = await _context.ClassRooms
                .FindAsync(id);

            if (classRoom == null)
            {
                return NotFound(new
                {
                    message = "Class/Course not found."
                });
            }

            var normalizedCode =
    string.IsNullOrWhiteSpace(request.Code)
        ? null
        : request.Code.Trim();

            if (normalizedCode != null)
            {
                var codeExists = await _context.ClassRooms
                    .AnyAsync(x =>
                        x.Code == normalizedCode &&
                        x.Id != id);

                if (codeExists)
                {
                    return BadRequest(new
                    {
                        message = "Class/Course code already exists."
                    });
                }
            }

            classRoom.Name = request.Name.Trim();
            classRoom.Code = normalizedCode;
            classRoom.Description = request.Description?.Trim();
            classRoom.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Class/Course {ClassRoomId} updated.",
                classRoom.Id
            );

            return Ok(new
            {
                message = "Class/Course updated successfully."
            });
        }

        // PATCH: api/ClassRooms/5/status?isActive=false
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromQuery] bool isActive)
        {
            var classRoom = await _context.ClassRooms
                .FindAsync(id);

            if (classRoom == null)
            {
                return NotFound(new
                {
                    message = "Class/Course not found."
                });
            }

            classRoom.IsActive = isActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = isActive
                    ? "Class/Course activated successfully."
                    : "Class/Course deactivated successfully."
            });
        }
    }
}
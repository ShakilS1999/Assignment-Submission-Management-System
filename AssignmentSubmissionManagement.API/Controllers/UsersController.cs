using AssignmentSubmissionManagement.API.Data;
using AssignmentSubmissionManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            ApplicationDbContext context,
            ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.Email,
                    x.Role,
                    x.IsActive,
                    x.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.Email,
                    x.Role,
                    x.IsActive,
                    x.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateUserRequest request)
        {
            var validRoles = new[]
            {
                "Admin",
                "Teacher",
                "Student"
            };

            if (!validRoles.Contains(
                request.Role,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Role must be Admin, Teacher or Student."
                });
            }

            var normalizedEmail =
     request.Email.Trim().ToLower();

            var emailExists = await _context.Users
                .AnyAsync(x => x.Email == normalizedEmail);

            if (emailExists)
            {
                return BadRequest(new
                {
                    message = "Email already exists."
                });
            }

            var normalizedRole = validRoles
                .First(x => x.Equals(
                    request.Role,
                    StringComparison.OrdinalIgnoreCase));

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Role = normalizedRole,
                IsActive = true
            };

            var passwordHasher = new PasswordHasher<User>();

            user.PasswordHash =
                passwordHasher.HashPassword(
                    user,
                    request.Password
                );

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Admin created user {Email} with role {Role}.",
                user.Email,
                user.Role
            );

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Role,
                    user.IsActive
                });
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var validRoles = new[]
            {
                "Admin",
                "Teacher",
                "Student"
            };

            if (!validRoles.Contains(
                request.Role,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Role must be Admin, Teacher or Student."
                });
            }

            var normalizedRole = validRoles
                .First(x => x.Equals(
                    request.Role,
                    StringComparison.OrdinalIgnoreCase));

            user.FullName = request.FullName.Trim();
            user.Role = normalizedRole;
            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "User {UserId} updated.",
                user.Id
            );

            return Ok(new
            {
                message = "User updated successfully."
            });
        }

        // PATCH: api/Users/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromQuery] bool isActive)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            user.IsActive = isActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = isActive
                    ? "User activated successfully."
                    : "User deactivated successfully."
            });
        }
    }
}
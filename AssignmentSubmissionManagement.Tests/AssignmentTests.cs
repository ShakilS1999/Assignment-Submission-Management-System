using AssignmentSubmissionManagement.API.Controllers;
using AssignmentSubmissionManagement.API.Data;
using AssignmentSubmissionManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;

namespace AssignmentSubmissionManagement.Tests
{
    public class AssignmentTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }


        private AssignmentsController CreateController(
            ApplicationDbContext context,
            int userId,
            string role)
        {
            var logger =
                new Mock<ILogger<AssignmentsController>>();

            var controller =
                new AssignmentsController(
                    context,
                    logger.Object);


            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId.ToString()),

                new Claim(
                    ClaimTypes.Role,
                    role)
            };


            var identity =
                new ClaimsIdentity(
                    claims,
                    "TestAuthentication");


            var principal =
                new ClaimsPrincipal(identity);


            controller.ControllerContext =
                new ControllerContext
                {
                    HttpContext =
                        new DefaultHttpContext
                        {
                            User = principal
                        }
                };


            return controller;
        }


        // =====================================================
        // TEST 1:
        // Teacher cannot create assignment with past deadline
        // =====================================================
        [Fact]
        public async Task Create_WhenDeadlinePassed_ReturnsBadRequest()
        {
            using var context =
                CreateDbContext();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var request =
                new AssignmentRequest
                {
                    Title =
                        "Past Deadline Assignment",

                    Description =
                        "Test Description",

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(-1),

                    MaximumMarks = 100,

                    IsPublished = true,

                    AllowSubmissionUpdate = true
                };


            var result =
                await controller.Create(
                    request);


            Assert.IsType<BadRequestObjectResult>(
                result);
        }


        // =====================================================
        // TEST 2:
        // Teacher cannot create assignment for
        // unassigned Class + Subject
        // =====================================================
        [Fact]
        public async Task Create_WhenTeacherNotAssigned_ReturnsBadRequest()
        {
            using var context =
                CreateDbContext();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var request =
                new AssignmentRequest
                {
                    Title =
                        "Unauthorized Class Assignment",

                    Description =
                        "Test Description",

                    ClassRoomId = 10,

                    SubjectId = 20,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = true,

                    AllowSubmissionUpdate = true
                };


            var result =
                await controller.Create(
                    request);


            Assert.IsType<BadRequestObjectResult>(
                result);
        }


        // =====================================================
        // TEST 3:
        // Teacher can create assignment when assigned
        // to Class + Subject
        // =====================================================
        [Fact]
        public async Task Create_WithValidData_ReturnsCreated()
        {
            using var context =
                CreateDbContext();


            var mapping =
                new TeacherClassSubject
                {
                    TeacherId = 1,
                    ClassRoomId = 1,
                    SubjectId = 1
                };


            context.TeacherClassSubjects.Add(
                mapping);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var request =
                new AssignmentRequest
                {
                    Title =
                        "Valid Assignment",

                    Description =
                        "Valid assignment description",

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = true,

                    AllowSubmissionUpdate = true
                };


            var result =
                await controller.Create(
                    request);


            Assert.IsType<CreatedAtActionResult>(
                result);


            var savedAssignment =
                await context.Assignments
                    .FirstOrDefaultAsync();


            Assert.NotNull(
                savedAssignment);

            Assert.Equal(
                1,
                savedAssignment.TeacherId);

            Assert.Equal(
                "Valid Assignment",
                savedAssignment.Title);

            Assert.True(
                savedAssignment.IsPublished);
        }


        // =====================================================
        // TEST 4:
        // Teacher cannot update another teacher's assignment
        // =====================================================
        [Fact]
        public async Task Update_WhenWrongTeacher_ReturnsForbid()
        {
            using var context =
                CreateDbContext();


            var assignment =
                new Assignment
                {
                    Id = 4,

                    Title =
                        "Other Teacher Assignment",

                    Description =
                        "Test",

                    TeacherId = 99,

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = true
                };


            context.Assignments.Add(
                assignment);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var request =
                new AssignmentRequest
                {
                    Title =
                        "Updated Assignment",

                    Description =
                        "Updated",

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(6),

                    MaximumMarks = 100,

                    IsPublished = true,

                    AllowSubmissionUpdate = true
                };


            var result =
                await controller.Update(
                    4,
                    request);


            Assert.IsType<ForbidResult>(
                result);
        }


        // =====================================================
        // TEST 5:
        // Teacher cannot delete another teacher's assignment
        // =====================================================
        [Fact]
        public async Task Delete_WhenWrongTeacher_ReturnsForbid()
        {
            using var context =
                CreateDbContext();


            var assignment =
                new Assignment
                {
                    Id = 5,

                    Title =
                        "Delete Ownership Test",

                    Description =
                        "Test",

                    TeacherId = 99,

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = true
                };


            context.Assignments.Add(
                assignment);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var result =
                await controller.Delete(
                    5);


            Assert.IsType<ForbidResult>(
                result);
        }


        // =====================================================
        // TEST 6:
        // Assignment cannot be deleted when
        // submissions already exist
        // =====================================================
        [Fact]
        public async Task Delete_WhenSubmissionExists_ReturnsBadRequest()
        {
            using var context =
                CreateDbContext();


            var assignment =
                new Assignment
                {
                    Id = 6,

                    Title =
                        "Assignment With Submission",

                    Description =
                        "Test",

                    TeacherId = 1,

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = true
                };


            context.Assignments.Add(
                assignment);


            var submission =
                new Submission
                {
                    Id = 6,

                    AssignmentId = 6,

                    StudentId = 2,

                    Answer =
                        "Student Answer",

                    Status =
                        "Submitted",

                    SubmittedAt =
                        DateTime.UtcNow
                };


            context.Submissions.Add(
                submission);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var result =
                await controller.Delete(
                    6);


            Assert.IsType<BadRequestObjectResult>(
                result);


            var assignmentStillExists =
                await context.Assignments
                    .AnyAsync(
                        x => x.Id == 6);


            Assert.True(
                assignmentStillExists);
        }


        // =====================================================
        // TEST 7:
        // Teacher can delete own assignment
        // when no submissions exist
        // =====================================================
        [Fact]
        public async Task Delete_WhenValid_ReturnsOk()
        {
            using var context =
                CreateDbContext();


            var assignment =
                new Assignment
                {
                    Id = 7,

                    Title =
                        "Delete Success Test",

                    Description =
                        "Test",

                    TeacherId = 1,

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = false
                };


            context.Assignments.Add(
                assignment);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var result =
                await controller.Delete(
                    7);


            Assert.IsType<OkObjectResult>(
                result);


            var assignmentExists =
                await context.Assignments
                    .AnyAsync(
                        x => x.Id == 7);


            Assert.False(
                assignmentExists);
        }


        // =====================================================
        // TEST 8:
        // Student cannot view unpublished assignment
        // =====================================================

        // =====================================================
        // TEST 8:
        // Student cannot view unpublished assignment
        // =====================================================
        [Fact]
        public async Task GetById_WhenStudentViewsDraft_ReturnsForbid()
        {
            using var context =
                CreateDbContext();


            // Teacher
            var teacher =
                new User
                {
                    Id = 1,
                    FullName = "Test Teacher",
                    Email = "teacher@test.com",
                    PasswordHash = "TestPasswordHash",
                    Role = "Teacher",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };


            // Class / Course
            var classRoom =
                new ClassRoom
                {
                    Id = 1,
                    Name = "Class 8",
                    Code = "C8",
                    IsActive = true
                };


            // Subject
            var subject =
                new Subject
                {
                    Id = 1,
                    Name = "Mathematics",
                    Code = "MATH",
                    IsActive = true
                };


            context.Users.Add(
                teacher);

            context.ClassRooms.Add(
                classRoom);

            context.Subjects.Add(
                subject);


            await context.SaveChangesAsync();


            // Draft Assignment
            var assignment =
                new Assignment
                {
                    Id = 8,

                    Title =
                        "Draft Assignment",

                    Description =
                        "Draft",

                    TeacherId = 1,

                    ClassRoomId = 1,

                    SubjectId = 1,

                    Deadline =
                        DateTime.UtcNow.AddDays(5),

                    MaximumMarks = 100,

                    IsPublished = false,

                    AllowSubmissionUpdate = true
                };


            context.Assignments.Add(
                assignment);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    2,
                    "Student");


            var result =
                await controller.GetById(
                    8);


            Assert.IsType<ForbidResult>(
                result);
        }
    }
}
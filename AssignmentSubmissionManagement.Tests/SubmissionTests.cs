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
    public class SubmissionTests
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


        private SubmissionsController CreateController(
            ApplicationDbContext context,
            int userId,
            string role)
        {
            var logger =
                new Mock<ILogger<SubmissionsController>>();

            var controller =
                new SubmissionsController(
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
        // Student cannot submit after deadline
        // =====================================================
        [Fact]
        public async Task CreateSubmission_WhenDeadlinePassed_ReturnsBadRequest()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 1,

                Title = "Test Assignment",

                Description = "Test Description",

                TeacherId = 1,

                ClassRoomId = 1,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                Deadline =
                    DateTime.UtcNow.AddDays(-1)
            };


            context.Assignments.Add(assignment);

            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new CreateSubmissionRequest
                {
                    AssignmentId = 1,
                    Answer = "My answer"
                };



            var result =
                await controller.Create(request);



            Assert.IsType<BadRequestObjectResult>(
                result);
        }





        // =====================================================
        // TEST 2:
        // Student cannot submit draft assignment
        // =====================================================
        [Fact]
        public async Task CreateSubmission_WhenAssignmentIsNotPublished_ReturnsBadRequest()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 2,

                Title = "Draft Assignment",

                Description = "Draft Test",

                TeacherId = 1,

                ClassRoomId = 1,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = false,

                Deadline =
                    DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);

            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new CreateSubmissionRequest
                {
                    AssignmentId = 2,

                    Answer = "My answer"
                };



            var result =
                await controller.Create(request);



            Assert.IsType<BadRequestObjectResult>(
                result);
        }





        // =====================================================
        // TEST 3:
        // Student cannot submit another class assignment
        // =====================================================
        [Fact]
        public async Task CreateSubmission_WhenStudentNotEnrolledInClass_ReturnsForbid()
        {
            using var context = CreateDbContext();



            var assignment = new Assignment
            {
                Id = 3,

                Title = "Other Class Assignment",

                Description = "Test",

                TeacherId = 1,

                ClassRoomId = 10,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                Deadline =
                    DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);



            var enrollment = new StudentEnrollment
            {
                StudentId = 2,

                ClassRoomId = 5,

                IsActive = true
            };


            context.StudentEnrollments.Add(enrollment);



            await context.SaveChangesAsync();




            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new CreateSubmissionRequest
                {
                    AssignmentId = 3,

                    Answer = "My answer"
                };



            var result =
                await controller.Create(request);



            Assert.IsType<ForbidResult>(
                result);
        }
        // =====================================================
        // TEST 4:
        // Student cannot submit same assignment twice
        // =====================================================
        [Fact]
        public async Task CreateSubmission_WhenAlreadySubmitted_ReturnsBadRequest()
        {
            // Arrange
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 4,

                Title = "Duplicate Submission Test",

                Description = "Test",

                TeacherId = 1,

                ClassRoomId = 1,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                Deadline =
                    DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);



            // Existing submission
            var existingSubmission = new Submission
            {
                AssignmentId = 4,

                StudentId = 2,

                Answer = "Old Answer",

                Status = "Submitted",

                SubmittedAt =
                    DateTime.UtcNow.AddHours(-1)
            };


            context.Submissions.Add(existingSubmission);



            // Student enrolled in same class
            var enrollment = new StudentEnrollment
            {
                StudentId = 2,

                ClassRoomId = 1,

                IsActive = true
            };


            context.StudentEnrollments.Add(enrollment);



            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new CreateSubmissionRequest
                {
                    AssignmentId = 4,

                    Answer = "New Answer"
                };



            // Act
            var result =
                await controller.Create(request);



            // Assert
            Assert.IsType<BadRequestObjectResult>(
                result);
        }
        // =====================================================
        // TEST 5:
        // Teacher cannot give marks greater than maximum marks
        // =====================================================
        [Fact]
        public async Task ReviewSubmission_WhenMarksExceedMaximum_ReturnsBadRequest()
        {
            using var context = CreateDbContext();

            var assignment = new Assignment
            {
                Id = 5,
                Title = "Review Test",
                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                Deadline = DateTime.UtcNow.AddDays(5)
            };

            context.Assignments.Add(assignment);


            var submission = new Submission
            {
                Id = 5,
                AssignmentId = 5,
                StudentId = 2,
                Answer = "Answer",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };

            context.Submissions.Add(submission);

            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");


            var request =
                new ReviewSubmissionRequest
                {
                    Marks = 120,
                    Feedback = "Good",
                    Status = "Reviewed"
                };


            var result =
                await controller.Review(
                    5,
                    request);


            Assert.IsType<BadRequestObjectResult>(result);
        }
        // =====================================================
        // TEST 6:
        // Teacher cannot review another teacher's assignment
        // =====================================================
        [Fact]
        public async Task ReviewSubmission_WhenWrongTeacher_ReturnsForbid()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 6,
                Title = "Wrong Teacher Test",
                TeacherId = 10,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                Deadline = DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);


            var submission = new Submission
            {
                Id = 6,
                AssignmentId = 6,
                StudentId = 2,
                Answer = "Answer",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };


            context.Submissions.Add(submission);

            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");



            var request =
                new ReviewSubmissionRequest
                {
                    Marks = 80,
                    Feedback = "Good",
                    Status = "Reviewed"
                };


            var result =
                await controller.Review(
                    6,
                    request);


            Assert.IsType<ForbidResult>(result);
        }
        // =====================================================
        // TEST 7:
        // Teacher can review submission successfully
        // =====================================================
        [Fact]
        public async Task ReviewSubmission_WithValidData_ReturnsOk()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 7,
                Title = "Review Success",
                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                Deadline = DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);


            var submission = new Submission
            {
                Id = 7,
                AssignmentId = 7,
                StudentId = 2,
                Answer = "Answer",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };


            context.Submissions.Add(submission);

            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    1,
                    "Teacher");



            var request =
                new ReviewSubmissionRequest
                {
                    Marks = 90,
                    Feedback = "Excellent",
                    Status = "Reviewed"
                };


            var result =
                await controller.Review(
                    7,
                    request);



            Assert.IsType<OkObjectResult>(result);
        }
        // =====================================================
        // TEST 8:
        // Student can update own submission before deadline
        // =====================================================
        [Fact]
        public async Task UpdateSubmission_WhenAllowed_ReturnsOk()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 8,
                Title = "Update Test",

                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                AllowSubmissionUpdate = true,

                Deadline =
                    DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);



            var submission = new Submission
            {
                Id = 8,

                AssignmentId = 8,

                StudentId = 2,

                Answer = "Old Answer",

                Status = "Submitted",

                SubmittedAt =
                    DateTime.UtcNow
            };


            context.Submissions.Add(submission);



            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new UpdateSubmissionRequest
                {
                    Answer = "Updated Answer"
                };



            var result =
                await controller.Update(
                    8,
                    request);



            Assert.IsType<OkObjectResult>(result);
        }
        // =====================================================
        // TEST 9:
        // Student cannot update after deadline
        // =====================================================
        [Fact]
        public async Task UpdateSubmission_WhenDeadlinePassed_ReturnsBadRequest()
        {
            using var context = CreateDbContext();



            var assignment = new Assignment
            {
                Id = 9,

                Title = "Late Update Test",

                TeacherId = 1,

                ClassRoomId = 1,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                AllowSubmissionUpdate = true,

                Deadline =
                    DateTime.UtcNow.AddDays(-1)
            };


            context.Assignments.Add(assignment);



            var submission = new Submission
            {
                Id = 9,

                AssignmentId = 9,

                StudentId = 2,

                Answer = "Answer",

                Status = "Submitted",

                SubmittedAt =
                    DateTime.UtcNow.AddDays(-2)
            };


            context.Submissions.Add(submission);



            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new UpdateSubmissionRequest
                {
                    Answer = "New Answer"
                };



            var result =
                await controller.Update(
                    9,
                    request);



            Assert.IsType<BadRequestObjectResult>(result);
        }
        // =====================================================
        // TEST 10:
        // Student cannot review submission
        // =====================================================
        [Fact]
        public async Task StudentTryingToReviewSubmission_ShouldNotBeAllowed()
        {
            using var context = CreateDbContext();



            var assignment = new Assignment
            {
                Id = 10,

                Title = "Authorization Test",

                TeacherId = 1,

                ClassRoomId = 1,

                SubjectId = 1,

                MaximumMarks = 100,

                IsPublished = true,

                Deadline =
                    DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);



            var submission = new Submission
            {
                Id = 10,

                AssignmentId = 10,

                StudentId = 2,

                Answer = "Answer",

                Status = "Submitted",

                SubmittedAt =
                    DateTime.UtcNow
            };


            context.Submissions.Add(submission);



            await context.SaveChangesAsync();



            var controller =
                CreateController(
                    context,
                    2,
                    "Student");



            var request =
                new ReviewSubmissionRequest
                {
                    Marks = 80,

                    Feedback = "Good",

                    Status = "Reviewed"
                };



            var result =
                await controller.Review(
                    10,
                    request);



            Assert.IsType<ForbidResult>(result);
        }
        // =====================================================
        // TEST 11:
        // Student can create a valid submission successfully
        // =====================================================
        [Fact]
        public async Task CreateSubmission_WithValidData_ReturnsCreated()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 11,
                Title = "Valid Submission Test",
                Description = "Test",
                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                AllowSubmissionUpdate = true,
                Deadline = DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);


            var enrollment = new StudentEnrollment
            {
                StudentId = 2,
                ClassRoomId = 1,
                IsActive = true
            };


            context.StudentEnrollments.Add(enrollment);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    2,
                    "Student");


            var request =
                new CreateSubmissionRequest
                {
                    AssignmentId = 11,
                    Answer = "This is my valid answer."
                };


            var result =
                await controller.Create(request);


            Assert.IsType<CreatedAtActionResult>(result);


            var savedSubmission =
                await context.Submissions
                    .FirstOrDefaultAsync(
                        x =>
                            x.AssignmentId == 11 &&
                            x.StudentId == 2);


            Assert.NotNull(savedSubmission);

            Assert.Equal(
                "This is my valid answer.",
                savedSubmission.Answer);

            Assert.Equal(
                "Submitted",
                savedSubmission.Status);
        }


        // =====================================================
        // TEST 12:
        // Student cannot update when
        // AllowSubmissionUpdate is false
        // =====================================================
        [Fact]
        public async Task UpdateSubmission_WhenUpdateNotAllowed_ReturnsBadRequest()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 12,
                Title = "Update Disabled Test",
                Description = "Test",
                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                AllowSubmissionUpdate = false,
                Deadline = DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);


            var submission = new Submission
            {
                Id = 12,
                AssignmentId = 12,
                StudentId = 2,
                Answer = "Original Answer",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };


            context.Submissions.Add(submission);


            await context.SaveChangesAsync();


            var controller =
                CreateController(
                    context,
                    2,
                    "Student");


            var request =
                new UpdateSubmissionRequest
                {
                    Answer = "Updated Answer"
                };


            var result =
                await controller.Update(
                    12,
                    request);


            Assert.IsType<BadRequestObjectResult>(
                result);


            var savedSubmission =
                await context.Submissions
                    .FirstAsync(
                        x => x.Id == 12);


            Assert.Equal(
                "Original Answer",
                savedSubmission.Answer);
        }


        // =====================================================
        // TEST 13:
        // Student cannot update another student's submission
        // =====================================================
        [Fact]
        public async Task UpdateSubmission_WhenWrongStudent_ReturnsForbid()
        {
            using var context = CreateDbContext();


            var assignment = new Assignment
            {
                Id = 13,
                Title = "Submission Ownership Test",
                Description = "Test",
                TeacherId = 1,
                ClassRoomId = 1,
                SubjectId = 1,
                MaximumMarks = 100,
                IsPublished = true,
                AllowSubmissionUpdate = true,
                Deadline = DateTime.UtcNow.AddDays(5)
            };


            context.Assignments.Add(assignment);


            // Submission belongs to Student 99
            var submission = new Submission
            {
                Id = 13,
                AssignmentId = 13,
                StudentId = 99,
                Answer = "Another Student Answer",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow
            };


            context.Submissions.Add(submission);


            await context.SaveChangesAsync();


            // Logged-in student is Student 2
            var controller =
                CreateController(
                    context,
                    2,
                    "Student");


            var request =
                new UpdateSubmissionRequest
                {
                    Answer = "Trying to change answer"
                };


            var result =
                await controller.Update(
                    13,
                    request);


            Assert.IsType<ForbidResult>(
                result);


            var savedSubmission =
                await context.Submissions
                    .FirstAsync(
                        x => x.Id == 13);


            Assert.Equal(
                "Another Student Answer",
                savedSubmission.Answer);
        }
    }
}
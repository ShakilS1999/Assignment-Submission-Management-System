using AssignmentSubmissionManagement.API.Data;
using AssignmentSubmissionManagement.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


// =====================================================
// SQL Server + Entity Framework Core
// =====================================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    );
});



// =====================================================
// CORS For Next.js Frontend
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "FrontendPolicy",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});



// =====================================================
// JWT Authentication
// =====================================================

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;


    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;

})
.AddJwtBearer(options =>
{

    options.TokenValidationParameters =
        new TokenValidationParameters
        {

            // Enable Role Authorization

            RoleClaimType =
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",


            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,


            ValidIssuer =
                builder.Configuration["Jwt:Issuer"],


            ValidAudience =
                builder.Configuration["Jwt:Audience"],


            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Key"]
                        ??
                        throw new InvalidOperationException(
                            "JWT Key is missing."
                        )
                    )
                )

        };

});



// =====================================================
// Authorization
// =====================================================

builder.Services.AddAuthorization();



// =====================================================
// Controllers
// =====================================================

builder.Services.AddControllers();



// =====================================================
// Swagger
// =====================================================

builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {

            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
            "Enter JWT Token"

        });



    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {

            {

                new OpenApiSecurityScheme
                {

                    Reference =
                    new OpenApiReference
                    {

                        Type =
                        ReferenceType.SecurityScheme,

                        Id = "Bearer"

                    }

                },

                Array.Empty<string>()

            }

        });

});



var app = builder.Build();



// =====================================================
// Database Migration + Seed Users
// =====================================================

using (var scope = app.Services.CreateScope())
{

    var context =
        scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();


    await context.Database.MigrateAsync();



    var passwordHasher =
        new PasswordHasher<User>();



    // Admin

    if (!await context.Users.AnyAsync(
        x => x.Email == "admin@example.com"))
    {

        var admin = new User
        {

            FullName = "Demo Admin",

            Email = "admin@example.com",

            Role = "Admin",

            IsActive = true

        };


        admin.PasswordHash =
            passwordHasher.HashPassword(
                admin,
                "Admin@123"
            );


        context.Users.Add(admin);

    }



    // Teacher

    if (!await context.Users.AnyAsync(
        x => x.Email == "teacher@example.com"))
    {

        var teacher = new User
        {

            FullName = "Demo Teacher",

            Email = "teacher@example.com",

            Role = "Teacher",

            IsActive = true

        };


        teacher.PasswordHash =
            passwordHasher.HashPassword(
                teacher,
                "Teacher@123"
            );


        context.Users.Add(teacher);

    }



    // Student

    if (!await context.Users.AnyAsync(
        x => x.Email == "student@example.com"))
    {

        var student = new User
        {

            FullName = "Demo Student",

            Email = "student@example.com",

            Role = "Student",

            IsActive = true

        };


        student.PasswordHash =
            passwordHasher.HashPassword(
                student,
                "Student@123"
            );


        context.Users.Add(student);

    }



    await context.SaveChangesAsync();
    // =====================================================
    // Sample Class / Course
    // =====================================================

    var classRoom = await context.ClassRooms
        .FirstOrDefaultAsync(x =>
            x.Code == "C8" ||
            x.Name == "Class 8");

    if (classRoom == null)
    {
        classRoom = new ClassRoom
        {
            Name = "Class 8",
            Code = "C8",
            Description = "Demo Class for testing",
            IsActive = true
        };

        context.ClassRooms.Add(classRoom);

        await context.SaveChangesAsync();
    }


    // =====================================================
    // Sample Subject
    // =====================================================

    var subject = await context.Subjects
        .FirstOrDefaultAsync(x =>
            x.Code == "MATH" ||
            x.Name == "Mathematics");

    if (subject == null)
    {
        subject = new Subject
        {
            Name = "Mathematics",
            Code = "MATH",
            Description = "Demo Mathematics Subject",
            IsActive = true
        };

        context.Subjects.Add(subject);

        await context.SaveChangesAsync();
    }


    // =====================================================
    // Get Demo Teacher and Student
    // =====================================================

    var demoTeacher = await context.Users
        .FirstAsync(x =>
            x.Email == "teacher@example.com");

    var demoStudent = await context.Users
        .FirstAsync(x =>
            x.Email == "student@example.com");


    // =====================================================
    // Teacher → Class → Subject Assignment
    // =====================================================

    var teacherAssignmentExists =
        await context.TeacherClassSubjects
            .AnyAsync(x =>
                x.TeacherId == demoTeacher.Id &&
                x.ClassRoomId == classRoom.Id &&
                x.SubjectId == subject.Id);

    if (!teacherAssignmentExists)
    {
        context.TeacherClassSubjects.Add(
            new TeacherClassSubject
            {
                TeacherId = demoTeacher.Id,
                ClassRoomId = classRoom.Id,
                SubjectId = subject.Id
            }
        );
    }


    // =====================================================
    // Student Enrollment
    // =====================================================

    var studentEnrollmentExists =
        await context.StudentEnrollments
            .AnyAsync(x =>
                x.StudentId == demoStudent.Id &&
                x.ClassRoomId == classRoom.Id);

    if (!studentEnrollmentExists)
    {
        context.StudentEnrollments.Add(
            new StudentEnrollment
            {
                StudentId = demoStudent.Id,
                ClassRoomId = classRoom.Id,
                IsActive = true
            }
        );
    }


    await context.SaveChangesAsync();

}



// =====================================================
// Middleware Pipeline
// =====================================================

if (app.Environment.IsDevelopment())
{

    app.UseSwagger();

    app.UseSwaggerUI();

}



app.UseHttpsRedirection();


// CORS must come before Authentication

app.UseCors(
    "FrontendPolicy"
);



app.UseAuthentication();


app.UseAuthorization();



app.MapControllers();


app.Run();
using AssignmentSubmissionManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionManagement.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ClassRoom> ClassRooms { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<TeacherClassSubject> TeacherClassSubjects { get; set; }
        public DbSet<StudentEnrollment> StudentEnrollments { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Email must be unique
            modelBuilder.Entity<User>()
                .HasIndex(x => x.Email)
                .IsUnique();

            // একই Teacher + Class + Subject duplicate হবে না
            modelBuilder.Entity<TeacherClassSubject>()
                .HasIndex(x => new
                {
                    x.TeacherId,
                    x.ClassRoomId,
                    x.SubjectId
                })
                .IsUnique();

            // একই Student একই Class-এ duplicate enrollment হবে না
            modelBuilder.Entity<StudentEnrollment>()
                .HasIndex(x => new
                {
                    x.StudentId,
                    x.ClassRoomId
                })
                .IsUnique();

            // একই Student একই Assignment-এ একবারই submission করবে
            modelBuilder.Entity<Submission>()
                .HasIndex(x => new
                {
                    x.AssignmentId,
                    x.StudentId
                })
                .IsUnique();

            // Relationships

            modelBuilder.Entity<TeacherClassSubject>()
                .HasOne(x => x.Teacher)
                .WithMany()
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherClassSubject>()
                .HasOne(x => x.ClassRoom)
                .WithMany()
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherClassSubject>()
                .HasOne(x => x.Subject)
                .WithMany()
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentEnrollment>()
                .HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentEnrollment>()
                .HasOne(x => x.ClassRoom)
                .WithMany()
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(x => x.Teacher)
                .WithMany()
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(x => x.ClassRoom)
                .WithMany()
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(x => x.Subject)
                .WithMany()
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Submission>()
                .HasOne(x => x.Assignment)
                .WithMany()
                .HasForeignKey(x => x.AssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Submission>()
                .HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
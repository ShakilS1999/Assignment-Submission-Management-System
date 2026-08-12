# Assignment & Submission Management System



A full-stack role-based school/college application built for the **Assistant Software Engineer Recruitment Project**.



The system allows administrators to manage academic setup and users, teachers to create and review assignments, and students to view, submit, and update assignment answers according to assignment rules.



---



## Main Features



### Admin



* Manage Admin, Teacher, and Student users

* Create and update Classes/Courses

* Create and update Subjects

* Activate or deactivate users

* Activate or deactivate Classes/Courses

* Activate or deactivate Subjects

* Assign Teachers to specific Classes/Courses and Subjects

* Enroll Students into Classes/Courses

* Activate or deactivate Student Enrollments

* View all Assignments

* View all Student Submissions



### Teacher



* View assigned Classes/Courses and Subjects

* Create Assignments

* Update own Assignments

* Delete own Assignments when no submissions exist

* Assign an Assignment to a specific Class/Course and Subject

* Define:



  * Title

  * Description

  * Deadline

  * Maximum Marks

* Save an Assignment as Draft

* Publish an Assignment

* Allow or disallow Submission Updates

* View Student Submissions for own Assignments

* Assign Marks

* Provide Feedback

* Change Submission Status



### Student



* View published Assignments assigned to the student's enrolled Class/Course

* View Assignment details and deadline

* Submit an Assignment answer

* Update own Submission before the deadline when updates are allowed

* View Submission status

* View Marks

* View Teacher Feedback



---



## Technology Stack



### Frontend



* Next.js

* React

* TypeScript

* Tailwind CSS

* Axios

* Responsive UI

* Client-side form validation



### Backend



* ASP.NET Core Web API

* C#

* .NET 8

* RESTful API

* Entity Framework Core

* JWT Authentication

* Role-Based Authorization

* Data Annotation Validation

* Logging

* Swagger / OpenAPI



### Database



* Microsoft SQL Server

* SQL Server Express

* Entity Framework Core Migrations



SQL Server was selected as an equivalent relational database technology suitable for the project and its required relationships.



### Testing



* xUnit

* Entity Framework Core InMemory

* Moq



---



## Project Structure



```text

Assignment-Submission-Management-System/

│

├── AssignmentSubmissionManagement.API/

│   ├── Controllers/

│   ├── Data/

│   ├── Migrations/

│   ├── Models/

│   ├── Properties/

│   ├── Program.cs

│   ├── appsettings.json

│   └── AssignmentSubmissionManagement.API.csproj

│

├── AssignmentSubmissionManagement.Tests/

│   ├── AssignmentTests.cs

│   ├── SubmissionTests.cs

│   └── AssignmentSubmissionManagement.Tests.csproj

│

├── assignment-submission-frontend/

│   ├── public/

│   ├── src/

│   │   ├── app/

│   │   ├── components/

│   │   ├── config/

│   │   ├── services/

│   │   ├── types/

│   │   └── utils/

│   ├── .env.example

│   ├── package.json

│   └── package-lock.json

│

├── AssignmentSubmissionManagement.API.sln

├── .env.example

├── .gitignore

└── README.md

```



---



## Architecture



The backend uses a simple controller-based ASP.NET Core Web API architecture:



```text

Next.js Frontend

       ↓

ASP.NET Core API Controllers

       ↓

ApplicationDbContext

       ↓

Entity Framework Core

       ↓

SQL Server

```



The project intentionally uses direct `ApplicationDbContext` access from controllers instead of adding Repository, Unit of Work, CQRS, or other additional architecture layers.



Request models are used where needed for API input validation.



---



## Prerequisites



Install the following before running the project:



* .NET 8 SDK

* SQL Server Express

* Node.js

* npm

* Git



Recommended development tools:



* Visual Studio 2022

* Visual Studio Code

* SQL Server Management Studio



---



# Backend Setup



## 1. Clone the Repository



```bash

git clone https://github.com/ShakilS1999/Assignment-Submission-Management-System.git
cd Assignment-Submission-Management-System

```



---



## 2. Restore .NET Packages



From the repository root:



```bash

dotnet restore

```



---



## 3. Database Configuration



The default development database uses SQL Server Express:



```text

Server=.\SQLEXPRESS;

Database=AssignmentSubmissionManagementDb;

Trusted_Connection=True;

TrustServerCertificate=True;

```



The connection string can be changed using ASP.NET Core configuration if required.



The repository contains an `.env.example` file documenting the relevant environment variable names.



Example:



```env

Jwt__Key=CHANGE_ME_WITH_A_STRONG_JWT_SECRET



ConnectionStrings__DefaultConnection=Server=.\SQLEXPRESS;Database=AssignmentSubmissionManagementDb;Trusted_Connection=True;TrustServerCertificate=True;

```



> ASP.NET Core does not load `.env` files automatically. The file is included as a configuration reference. Use User Secrets or operating-system environment variables for local sensitive values.



---



## 4. Configure JWT Secret



For local development, User Secrets are recommended.



Move into the backend API project:



```bash

cd AssignmentSubmissionManagement.API

```



Initialize User Secrets if they are not already initialized:



```bash

dotnet user-secrets init

```



Set a local JWT key:



```bash

dotnet user-secrets set "Jwt:Key" "YOUR_STRONG_LOCAL_JWT_SECRET_KEY"

```



Do not commit a real JWT secret to the repository.



---



## 5. Database Migration and Seed Data



Entity Framework Core migrations are included in the project.



The application automatically runs:



```csharp

Database.MigrateAsync()

```



during startup.



Therefore, when the API runs against a fresh SQL Server database:



1. Required database tables are created through migrations.

2. Demo users are created when they do not already exist.

3. A sample Class/Course is created.

4. A sample Subject is created.

5. The Demo Teacher is assigned to the sample Class/Course and Subject.

6. The Demo Student is enrolled in the sample Class/Course.



Default sample academic data includes:



```text

Class / Course: Class 8

Code: C8



Subject: Mathematics

Code: MATH

```



The seed logic checks existing data before inserting records to avoid duplicate sample data.



---



## 6. Run Backend API



From:



```text

AssignmentSubmissionManagement.API

```



run:



```bash

dotnet run

```



Alternatively, run the API from Visual Studio.



---



## Swagger / OpenAPI



When running in the Development environment, Swagger UI is enabled.



Open the Swagger URL shown by the ASP.NET Core application after startup.



Swagger supports JWT Bearer authentication.



For authenticated endpoints:



1. Login using `/api/Auth/login`

2. Copy the JWT token

3. Click **Authorize** in Swagger

4. Enter the raw JWT token



---



# Frontend Setup



Open another terminal and move into:



```bash

cd assignment-submission-frontend

```



---



## 1. Install Dependencies



```bash

npm install

```



---



## 2. Configure Frontend Environment



The frontend includes:



```text

.env.example

```



Its default value is:



```env

NEXT_PUBLIC_API_URL=https://localhost:7123/api

```



Create a local environment file.



Windows CMD:



```cmd

copy .env.example .env.local

```



Update the API URL in `.env.local` if your ASP.NET Core API uses a different HTTPS port.



`.env.local` is intentionally excluded from Git.



---



## 3. Run Frontend



```bash

npm run dev

```



Open:



```text

http://localhost:3000

```



---



## 4. Production Build



To verify the frontend production build:



```bash

npm run build

```



---



# Demo Credentials



The application includes working demo accounts for all three required roles.



## Admin



```text

Email: admin@example.com

Password: Admin@123

```



## Teacher



```text

Email: teacher@example.com

Password: Teacher@123

```



## Student



```text

Email: student@example.com

Password: Student@123

```



---



# Running Tests



From the repository root, run:



```bash

dotnet test

```



Current automated test suite:



```text

Total Tests: 21

Failed: 0

Passed: 21

Skipped: 0

```



The tests cover important Assignment and Submission business rules, including:



* Creating an Assignment with an invalid deadline

* Teacher/Class/Subject assignment validation

* Teacher ownership validation

* Assignment deletion rules

* Student access to draft Assignments

* Submission deadline validation

* Published Assignment validation

* Student enrollment validation

* Duplicate Submission prevention

* Submission update rules

* Submission ownership

* Teacher review authorization

* Maximum Marks validation

* Valid Submission creation

* Valid Submission update

* Valid Submission review



---



# Authentication and Authorization



Authentication is implemented using JWT.



JWT contains:



* User ID

* Full Name

* Email

* Role



Backend endpoints enforce role-based access using ASP.NET Core authorization.



Examples:



```text

Admin-only endpoints

Teacher-only endpoints

Student-only endpoints

Authenticated shared endpoints

```



Frontend role checks are used for navigation and user experience, while the backend API remains the actual security enforcement layer.



---



# Important Business Rules



The application implements the following rules:



* Only Teachers can create Assignments.

* A Teacher can create an Assignment only for a Class/Course and Subject assigned to that Teacher.

* Assignment deadlines must be in the future when creating or updating an Assignment.

* Students only see published Assignments belonging to their active enrolled Class/Course.

* Students cannot submit to Draft Assignments.

* Students cannot submit after the Assignment deadline.

* Students must have an active enrollment in the Assignment's Class/Course.

* A Student can have only one Submission per Assignment.

* Submission Updates are allowed only before the deadline and only when enabled by the Teacher.

* Teachers can review only Submissions belonging to their own Assignments.

* Marks cannot exceed the Assignment's Maximum Marks.

* Supported Submission statuses are:



  * Submitted

  * Reviewed

  * NeedsRevision

* An Assignment cannot be deleted after Student Submissions exist.



---



# Form Validation



Frontend and backend validation are both implemented.



Examples include:



* Required fields

* Email validation

* Password minimum length

* Maximum field lengths

* Valid role validation

* Assignment title length

* Future Assignment deadline

* Maximum Marks range

* Valid Teacher/Class/Subject selection

* Valid Student/Class enrollment

* Required Submission answer

* Submission deadline checks

* Review Marks validation



Backend Data Annotation validation is supported through ASP.NET Core `[ApiController]`.



---



# Error Handling



The API returns appropriate HTTP responses for expected application errors.



Examples:



* `400 Bad Request`

* `401 Unauthorized`

* `403 Forbidden`

* `404 Not Found`



Meaningful error messages are returned for expected validation and business-rule failures.



The frontend also handles API errors and displays user-friendly messages.



---



# Logging



ASP.NET Core `ILogger` is used for important operations, including:



* User creation

* Class/Course creation and update

* Subject creation and update

* Teacher/Class/Subject assignment

* Student enrollment

* Assignment creation

* Submission creation

* Submission update

* Submission review

* Successful login



---



# Seed / Sample Data



Fresh database setup automatically creates sample data when missing:



```text

Demo Admin

Demo Teacher

Demo Student



Class 8

Mathematics



Demo Teacher

    ↓

Class 8

    ↓

Mathematics



Demo Student

    ↓

Class 8

```



Assignments and Submissions are intentionally not automatically seeded so that the evaluator can test the actual Teacher and Student workflows.



---



# Assumptions and Design Decisions



The following assumptions were made where the project brief did not explicitly define behavior.



### 1. SQL Server



SQL Server was selected as an equivalent database technology suitable for implementing the required relational data model.



### 2. Submission Type



A Submission contains a text answer.



File upload support was not added because the required Student responsibility is to submit an answer, and file attachments were not explicitly required.



### 3. Editing Reviewed Submissions



If a Student updates an existing Submission before the deadline and updates are allowed:



* Status is reset to `Submitted`

* Existing Marks are cleared

* Existing Feedback is cleared

* Review timestamp is cleared



This ensures the Teacher reviews the latest version of the Student's answer.



### 4. Assignment Deletion



Teachers cannot delete an Assignment after one or more Student Submissions exist.



This prevents accidental loss of Student Submission records.



### 5. Application-Level Settings



No separate application-settings module was added because no mandatory application-level setting was required for the implemented workflow.



### 6. Backend Architecture



A simple controller-based architecture using Entity Framework Core directly through `ApplicationDbContext` was chosen to keep the solution focused on the recruitment project's functional and technical requirements.



---



# Known Limitations



* File attachment upload is not implemented.

* Notifications are not implemented.

* Pagination is not implemented.

* Advanced filtering/search is not implemented.

* Docker configuration is not included.

* No live production deployment URL is included.

* CORS is configured for the local frontend at `http://localhost:3000`.

* The default local database configuration assumes SQL Server Express is available as `.\SQLEXPRESS`.



These features are outside the mandatory project workflow or were listed as optional enhancements.



---



# Security Notes



* Passwords are stored as password hashes.

* JWT authentication is used for protected API access.

* Role-based authorization is enforced by the backend API.

* Real JWT secrets should not be committed to Git.

* Local JWT secrets can be stored using ASP.NET Core User Secrets.

* `.env.local` is excluded from Git.

* `.env.example` contains configuration examples only.

* Build outputs and local IDE files are excluded through `.gitignore`.



---



# Final Verification



Before submission, the following should be verified:



* Backend builds successfully

* Frontend builds successfully

* All automated tests pass

* SQL Server database can be created from migrations

* Seed/sample data is created

* Admin login works

* Teacher login works

* Student login works

* Role-based API restrictions work

* Swagger runs successfully

* No real secrets are committed

* `.env.example` is included

* Migration files are included

* Frontend and backend are included in the same repository



---



## Project Status



Core project development is complete.



Current automated test result:



```text

21 Passed

0 Failed

```




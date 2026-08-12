import api from "@/config/api";

export interface Assignment {
    id: number;
    title: string;
    description: string;
    deadline: string;
    maximumMarks: number;

    isPublished?: boolean;
    allowSubmissionUpdate: boolean;

    teacherId?: number;
    teacherName?: string;

    classRoomId?: number;
    classRoomName?: string;

    subjectId?: number;
    subjectName?: string;

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAssignmentRequest {
    title: string;
    description: string;
    deadline: string;
    maximumMarks: number;

    isPublished: boolean;
    allowSubmissionUpdate: boolean;

    classRoomId: number;
    subjectId: number;
}


// ========================================
// ADMIN - View all assignments
// GET /api/Assignments/all
// ========================================
export const getAllAssignments =
    async (): Promise<Assignment[]> => {

        const response =
            await api.get<Assignment[]>("/Assignments/all");

        return response.data;
    };


// ========================================
// TEACHER - View own assignments
// GET /api/Assignments/my
// ========================================
export const getMyAssignments =
    async (): Promise<Assignment[]> => {

        const response =
            await api.get<Assignment[]>("/Assignments/my");

        return response.data;
    };


// ========================================
// STUDENT - View published assignments
// GET /api/Assignments/student
// ========================================
export const getStudentAssignments =
    async (): Promise<Assignment[]> => {

        const response =
            await api.get<Assignment[]>("/Assignments/student");

        return response.data;
    };


// ========================================
// Role Based Assignment Loader
// ========================================
export const getAssignmentsByRole =
    async (role: string): Promise<Assignment[]> => {

        switch (role) {

            case "Admin":
                return await getAllAssignments();

            case "Teacher":
                return await getMyAssignments();

            case "Student":
                return await getStudentAssignments();

            default:
                return [];
        }
    };


// ========================================
// TEACHER - Create Assignment
// POST /api/Assignments
// ========================================
export const createAssignment =
    async (
        data: CreateAssignmentRequest
    ) => {

        const response =
            await api.post(
                "/Assignments",
                data
            );

        return response.data;
    };
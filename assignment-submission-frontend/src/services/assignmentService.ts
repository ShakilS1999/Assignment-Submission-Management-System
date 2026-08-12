import api from "@/config/api";

export interface Assignment {
    id: number;
    title: string;
    description: string;

    deadline: string;
    maximumMarks: number;

    isPublished?: boolean;
    allowSubmissionUpdate?: boolean;

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
// ADMIN
// GET /api/Assignments/all
// ========================================
export const getAllAssignments = async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(
        "/Assignments/all"
    );

    return response.data;
};

// ========================================
// TEACHER
// GET /api/Assignments/my
// ========================================
export const getMyAssignments = async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(
        "/Assignments/my"
    );

    return response.data;
};

// ========================================
// STUDENT
// GET /api/Assignments/student
// ========================================
export const getStudentAssignments = async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(
        "/Assignments/student"
    );

    return response.data;
};

// ========================================
// ROLE BASED ASSIGNMENT LOAD
// ========================================
export const getAssignmentsByRole = async (
    role: string
): Promise<Assignment[]> => {
    if (role === "Admin") {
        return await getAllAssignments();
    }

    if (role === "Teacher") {
        return await getMyAssignments();
    }

    if (role === "Student") {
        return await getStudentAssignments();
    }

    return [];
};

// ========================================
// GET ASSIGNMENT BY ID
// GET /api/Assignments/{id}
// ========================================
export const getAssignmentById = async (
    id: number
): Promise<Assignment> => {
    const response = await api.get<Assignment>(
        `/Assignments/${id}`
    );

    return response.data;
};

// ========================================
// TEACHER - CREATE ASSIGNMENT
// POST /api/Assignments
// ========================================
export const createAssignment = async (
    data: CreateAssignmentRequest
) => {
    const response = await api.post(
        "/Assignments",
        data
    );

    return response.data;
};

// ========================================
// TEACHER - UPDATE OWN ASSIGNMENT
// PUT /api/Assignments/{id}
// ========================================
export const updateAssignment = async (
    id: number,
    data: CreateAssignmentRequest
): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
        `/Assignments/${id}`,
        data
    );

    return response.data;
};

// ========================================
// TEACHER - DELETE OWN ASSIGNMENT
// DELETE /api/Assignments/{id}
// ========================================
export const deleteAssignment = async (
    id: number
): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
        `/Assignments/${id}`
    );

    return response.data;
};
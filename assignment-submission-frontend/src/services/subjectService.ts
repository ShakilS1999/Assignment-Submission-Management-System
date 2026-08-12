import api from "@/config/api";

export interface Subject {
    id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface SubjectRequest {
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
}

// ========================================
// ADMIN - GET ALL SUBJECTS
// GET /api/Subjects
// ========================================
export const getSubjects = async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>("/Subjects");

    return response.data;
};

// ========================================
// ADMIN - GET SUBJECT BY ID
// GET /api/Subjects/{id}
// ========================================
export const getSubjectById = async (
    id: number
): Promise<Subject> => {
    const response = await api.get<Subject>(
        `/Subjects/${id}`
    );

    return response.data;
};

// ========================================
// ADMIN - CREATE SUBJECT
// POST /api/Subjects
// ========================================
export const createSubject = async (
    data: SubjectRequest
): Promise<Subject> => {
    const response = await api.post<Subject>(
        "/Subjects",
        data
    );

    return response.data;
};

// ========================================
// ADMIN - UPDATE SUBJECT
// PUT /api/Subjects/{id}
// ========================================
export const updateSubject = async (
    id: number,
    data: SubjectRequest
): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
        `/Subjects/${id}`,
        data
    );

    return response.data;
};

// ========================================
// ADMIN - CHANGE SUBJECT STATUS
// PATCH /api/Subjects/{id}/status
// ========================================
export const changeSubjectStatus = async (
    id: number,
    isActive: boolean
): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
        `/Subjects/${id}/status`,
        null,
        {
            params: {
                isActive,
            },
        }
    );

    return response.data;
};
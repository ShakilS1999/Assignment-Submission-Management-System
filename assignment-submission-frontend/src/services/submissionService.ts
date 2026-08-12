import api from "@/config/api";
export interface AdminSubmission {
    id: number;

    assignmentId: number;
    assignmentTitle: string;

    studentId: number;
    studentName: string;
    studentEmail: string;

    answer: string;
    status: string;

    marks: number | null;
    feedback: string | null;

    submittedAt: string;
    updatedAt: string | null;
    reviewedAt: string | null;
}

// =====================================================
// TYPES
// =====================================================

export interface MySubmission {
    id: number;

    assignmentId: number;
    assignmentTitle: string;

    answer: string;
    status: string;

    marks: number | null;
    feedback: string | null;

    assignmentDeadline: string;
    maximumMarks: number;

    submittedAt: string;
    updatedAt: string | null;
    reviewedAt: string | null;
}


export interface TeacherSubmission {
    id: number;

    studentId: number;
    studentName: string;
    studentEmail: string;

    answer: string;
    status: string;

    marks: number | null;
    feedback: string | null;

    submittedAt: string;
    updatedAt: string | null;
    reviewedAt: string | null;
}


export interface CreateSubmissionRequest {
    assignmentId: number;
    answer: string;
}


export interface UpdateSubmissionRequest {
    answer: string;
}


export interface ReviewSubmissionRequest {
    marks: number;
    feedback?: string;
    status: "Submitted" | "Reviewed" | "NeedsRevision";
}


// =====================================================
// STUDENT - GET OWN SUBMISSIONS
// GET /api/Submissions/my
// =====================================================

export const getMySubmissions =
    async (): Promise<MySubmission[]> => {

        const response =
            await api.get<MySubmission[]>(
                "/Submissions/my"
            );

        return response.data;
    };


// =====================================================
// STUDENT - CREATE SUBMISSION
// POST /api/Submissions
// =====================================================

export const createSubmission =
    async (
        data: CreateSubmissionRequest
    ) => {

        const response = await api.post(
            "/Submissions",
            data
        );

        return response.data;
    };


// =====================================================
// STUDENT - UPDATE OWN SUBMISSION
// PUT /api/Submissions/{id}
// =====================================================

export const updateSubmission =
    async (
        id: number,
        data: UpdateSubmissionRequest
    ): Promise<{ message: string }> => {

        const response =
            await api.put<{ message: string }>(
                `/Submissions/${id}`,
                data
            );

        return response.data;
    };


// =====================================================
// TEACHER - GET SUBMISSIONS FOR OWN ASSIGNMENT
// GET /api/Submissions/assignment/{assignmentId}
// =====================================================

export const getAssignmentSubmissions =
    async (
        assignmentId: number
    ): Promise<TeacherSubmission[]> => {

        const response =
            await api.get<TeacherSubmission[]>(
                `/Submissions/assignment/${assignmentId}`
            );

        return response.data;
    };


// =====================================================
// TEACHER - REVIEW SUBMISSION
// PUT /api/Submissions/{id}/review
// =====================================================

export const reviewSubmission =
    async (
        id: number,
        data: ReviewSubmissionRequest
    ) => {

        const response = await api.put(
            `/Submissions/${id}/review`,
            data
        );

        return response.data;
    };

// =====================================================
// ADMIN - GET ALL SUBMISSIONS
// GET /api/Submissions/all
// =====================================================
export const getAllSubmissions =
    async (): Promise<AdminSubmission[]> => {

        const response =
            await api.get<AdminSubmission[]>(
                "/Submissions/all"
            );

        return response.data;
    };
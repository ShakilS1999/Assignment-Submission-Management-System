import api from "@/config/api";

export interface StudentEnrollment {
    id: number;

    studentId: number;
    studentName: string;
    studentEmail: string;

    classRoomId: number;
    classRoomName: string;

    isActive: boolean;
    enrolledAt: string;
}

export interface StudentEnrollmentRequest {
    studentId: number;
    classRoomId: number;
}

// ========================================
// ADMIN - GET ALL STUDENT ENROLLMENTS
// GET /api/StudentEnrollments
// ========================================
export const getStudentEnrollments =
    async (): Promise<StudentEnrollment[]> => {

        const response =
            await api.get<StudentEnrollment[]>(
                "/StudentEnrollments"
            );

        return response.data;
    };


// ========================================
// ADMIN - GET ENROLLMENT BY ID
// GET /api/StudentEnrollments/{id}
// ========================================
export const getStudentEnrollmentById =
    async (
        id: number
    ): Promise<StudentEnrollment> => {

        const response =
            await api.get<StudentEnrollment>(
                `/StudentEnrollments/${id}`
            );

        return response.data;
    };


// ========================================
// ADMIN - ENROLL STUDENT
// POST /api/StudentEnrollments
// ========================================
export const createStudentEnrollment =
    async (
        data: StudentEnrollmentRequest
    ) => {

        const response = await api.post(
            "/StudentEnrollments",
            data
        );

        return response.data;
    };


// ========================================
// ADMIN - CHANGE ENROLLMENT STATUS
// PATCH /api/StudentEnrollments/{id}/status
// ========================================
export const changeStudentEnrollmentStatus =
    async (
        id: number,
        isActive: boolean
    ): Promise<{ message: string }> => {

        const response =
            await api.patch<{ message: string }>(
                `/StudentEnrollments/${id}/status`,
                null,
                {
                    params: {
                        isActive,
                    },
                }
            );

        return response.data;
    };
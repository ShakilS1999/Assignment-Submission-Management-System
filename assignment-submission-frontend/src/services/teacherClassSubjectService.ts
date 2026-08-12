import api from "@/config/api";

export interface TeacherClassSubject {
    id: number;

    teacherId: number;
    teacherName: string;

    classRoomId: number;
    classRoomName: string;

    subjectId: number;
    subjectName: string;

    assignedAt: string;
}

export interface TeacherClassSubjectRequest {
    teacherId: number;
    classRoomId: number;
    subjectId: number;
}


// ========================================
// ADMIN - GET ALL ASSIGNMENTS
// GET /api/TeacherClassSubjects
// ========================================
export const getTeacherClassSubjects =
    async (): Promise<TeacherClassSubject[]> => {

        const response =
            await api.get<TeacherClassSubject[]>(
                "/TeacherClassSubjects"
            );

        return response.data;
    };


// ========================================
// ADMIN - GET BY ID
// GET /api/TeacherClassSubjects/{id}
// ========================================
export const getTeacherClassSubjectById =
    async (
        id: number
    ): Promise<TeacherClassSubject> => {

        const response =
            await api.get<TeacherClassSubject>(
                `/TeacherClassSubjects/${id}`
            );

        return response.data;
    };


// ========================================
// ADMIN - ASSIGN TEACHER
// POST /api/TeacherClassSubjects
// ========================================
export const createTeacherClassSubject =
    async (
        data: TeacherClassSubjectRequest
    ) => {

        const response = await api.post(
            "/TeacherClassSubjects",
            data
        );

        return response.data;
    };


// ========================================
// ADMIN - REMOVE ASSIGNMENT
// DELETE /api/TeacherClassSubjects/{id}
// ========================================
export const deleteTeacherClassSubject =
    async (
        id: number
    ): Promise<{ message: string }> => {

        const response =
            await api.delete<{ message: string }>(
                `/TeacherClassSubjects/${id}`
            );

        return response.data;
    };

    export interface MyTeacherClassSubject {
    id: number;

    classRoomId: number;
    classRoomName: string;

    subjectId: number;
    subjectName: string;

    assignedAt: string;
}
// ========================================
// TEACHER - GET OWN CLASS/SUBJECT ASSIGNMENTS
// GET /api/TeacherClassSubjects/my
// ========================================
export const getMyTeacherClassSubjects =
    async (): Promise<MyTeacherClassSubject[]> => {

        const response =
            await api.get<MyTeacherClassSubject[]>(
                "/TeacherClassSubjects/my"
            );

        return response.data;
    };
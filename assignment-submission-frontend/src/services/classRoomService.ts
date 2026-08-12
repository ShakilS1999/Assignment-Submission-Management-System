import api from "@/config/api";

export interface ClassRoom {
    id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface ClassRoomRequest {
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
}

// ========================================
// ADMIN - GET ALL CLASSROOMS
// GET /api/ClassRooms
// ========================================
export const getClassRooms = async (): Promise<ClassRoom[]> => {
    const response = await api.get<ClassRoom[]>("/ClassRooms");

    return response.data;
};

// ========================================
// ADMIN - GET CLASSROOM BY ID
// GET /api/ClassRooms/{id}
// ========================================
export const getClassRoomById = async (
    id: number
): Promise<ClassRoom> => {
    const response = await api.get<ClassRoom>(
        `/ClassRooms/${id}`
    );

    return response.data;
};

// ========================================
// ADMIN - CREATE CLASSROOM
// POST /api/ClassRooms
// ========================================
export const createClassRoom = async (
    data: ClassRoomRequest
): Promise<ClassRoom> => {
    const response = await api.post<ClassRoom>(
        "/ClassRooms",
        data
    );

    return response.data;
};

// ========================================
// ADMIN - UPDATE CLASSROOM
// PUT /api/ClassRooms/{id}
// ========================================
export const updateClassRoom = async (
    id: number,
    data: ClassRoomRequest
): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
        `/ClassRooms/${id}`,
        data
    );

    return response.data;
};

// ========================================
// ADMIN - CHANGE ACTIVE STATUS
// PATCH /api/ClassRooms/{id}/status
// ========================================
export const changeClassRoomStatus = async (
    id: number,
    isActive: boolean
): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
        `/ClassRooms/${id}/status`,
        null,
        {
            params: {
                isActive,
            },
        }
    );

    return response.data;
};
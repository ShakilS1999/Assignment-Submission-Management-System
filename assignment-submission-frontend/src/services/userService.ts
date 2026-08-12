import api from "@/config/api";

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserRequest {
    fullName: string;
    role: string;
    isActive: boolean;
}

// ========================================
// ADMIN - GET ALL USERS
// GET /api/Users
// ========================================
export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>("/Users");

    return response.data;
};

// ========================================
// ADMIN - GET USER BY ID
// GET /api/Users/{id}
// ========================================
export const getUserById = async (
    id: number
): Promise<User> => {
    const response = await api.get<User>(
        `/Users/${id}`
    );

    return response.data;
};

// ========================================
// ADMIN - CREATE USER
// POST /api/Users
// ========================================
export const createUser = async (
    data: CreateUserRequest
): Promise<User> => {
    const response = await api.post<User>(
        "/Users",
        data
    );

    return response.data;
};

// ========================================
// ADMIN - UPDATE USER
// PUT /api/Users/{id}
// ========================================
export const updateUser = async (
    id: number,
    data: UpdateUserRequest
): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
        `/Users/${id}`,
        data
    );

    return response.data;
};

// ========================================
// ADMIN - CHANGE USER STATUS
// PATCH /api/Users/{id}/status
// ========================================
export const changeUserStatus = async (
    id: number,
    isActive: boolean
): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
        `/Users/${id}/status`,
        null,
        {
            params: {
                isActive,
            },
        }
    );

    return response.data;
};

// ========================================
// ADMIN - GET ACTIVE TEACHERS
// Uses GET /api/Users
// ========================================
export const getActiveTeachers = async (): Promise<User[]> => {
    const users = await getUsers();

    return users.filter(
        (user) =>
            user.role === "Teacher" &&
            user.isActive
    );
};

// ========================================
// ADMIN - GET ACTIVE STUDENTS
// Uses GET /api/Users
// ========================================
export const getActiveStudents = async (): Promise<User[]> => {
    const users = await getUsers();

    return users.filter(
        (user) =>
            user.role === "Student" &&
            user.isActive
    );
};
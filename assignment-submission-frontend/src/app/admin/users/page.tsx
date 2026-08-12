"use client";

import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
} from "react";

import { useRouter } from "next/navigation";
import axios from "axios";

import Navbar from "@/components/Navbar";

import {
    changeUserStatus,
    createUser,
    getUsers,
    updateUser,
    type User,
} from "@/services/userService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function UsersPage() {
    const router = useRouter();


    // ========================================
    // Data
    // ========================================
    const [users, setUsers] =
        useState<User[]>([]);


    // ========================================
    // Form
    // ========================================
    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [fullName, setFullName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [role, setRole] =
        useState("Student");

    const [isActive, setIsActive] =
        useState(true);


    // ========================================
    // UI State
    // ========================================
    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [
        statusLoadingId,
        setStatusLoadingId,
    ] =
        useState<number | null>(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================
    // Load Users
    // ========================================
    const loadUsers =
        useCallback(async () => {

            try {
                const data =
                    await getUsers();

                setUsers(data);

            } catch (err) {
                console.error(
                    "User Load Error:",
                    err
                );

                setError(
                    "Failed to load users."
                );
            }

        }, []);


    // ========================================
    // Initial Load + Admin Protection
    // ========================================
    useEffect(() => {

        const initializePage =
            async () => {

                const token =
                    getToken();


                if (!token) {
                    router.push(
                        "/login"
                    );

                    return;
                }


                const storedUser =
                    localStorage.getItem(
                        "user"
                    );


                if (!storedUser) {
                    router.push(
                        "/login"
                    );

                    return;
                }


                try {
                    const loggedInUser:
                        LoggedInUser =
                        JSON.parse(
                            storedUser
                        );


                    if (
                        loggedInUser.role !==
                        "Admin"
                    ) {
                        router.push(
                            "/dashboard"
                        );

                        return;
                    }


                    await loadUsers();

                } catch {
                    router.push(
                        "/login"
                    );

                } finally {
                    setLoading(
                        false
                    );
                }
            };


        initializePage();

    }, [
        router,
        loadUsers,
    ]);


    // ========================================
    // Reset Form
    // ========================================
    const resetForm = () => {
        setEditingId(null);

        setFullName("");
        setEmail("");
        setPassword("");
        setRole("Student");
        setIsActive(true);
    };


    // ========================================
    // Create / Update
    // ========================================
    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            setError("");
            setSuccess("");


            const trimmedName =
                fullName.trim();

            const trimmedEmail =
                email
                    .trim()
                    .toLowerCase();


            // ====================================
            // Common Validation
            // ====================================
            if (!trimmedName) {
                setError(
                    "Full name is required."
                );

                return;
            }


            if (
                trimmedName.length >
                100
            ) {
                setError(
                    "Full name cannot exceed 100 characters."
                );

                return;
            }


            if (
                ![
                    "Admin",
                    "Teacher",
                    "Student",
                ].includes(role)
            ) {
                setError(
                    "Please select a valid role."
                );

                return;
            }


            // ====================================
            // Create Validation
            // ====================================
            if (
                editingId ===
                null
            ) {
                if (
                    !trimmedEmail
                ) {
                    setError(
                        "Email is required."
                    );

                    return;
                }


                if (
                    trimmedEmail.length >
                    150
                ) {
                    setError(
                        "Email cannot exceed 150 characters."
                    );

                    return;
                }


                if (!password) {
                    setError(
                        "Password is required."
                    );

                    return;
                }


                if (
                    password.length <
                    6
                ) {
                    setError(
                        "Password must be at least 6 characters."
                    );

                    return;
                }
            }


            try {
                setSubmitting(
                    true
                );


                // =================================
                // UPDATE USER
                // =================================
                if (
                    editingId !==
                    null
                ) {
                    await updateUser(
                        editingId,
                        {
                            fullName:
                                trimmedName,

                            role,

                            isActive,
                        }
                    );


                    setSuccess(
                        "User updated successfully."
                    );
                }

                // =================================
                // CREATE USER
                // =================================
                else {
                    await createUser({
                        fullName:
                            trimmedName,

                        email:
                            trimmedEmail,

                        password,

                        role,
                    });


                    setSuccess(
                        "User created successfully."
                    );
                }


                resetForm();

                await loadUsers();

            } catch (
                err: unknown
            ) {
                console.error(
                    "User Save Error:",
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {
                    const message =
                        err.response
                            ?.data
                            ?.message;


                    setError(
                        message ||
                            "Failed to save user."
                    );

                } else {
                    setError(
                        "Failed to save user."
                    );
                }

            } finally {
                setSubmitting(
                    false
                );
            }
        };


    // ========================================
    // Edit
    // ========================================
    const handleEdit = (
        user: User
    ) => {

        setError("");
        setSuccess("");


        setEditingId(
            user.id
        );

        setFullName(
            user.fullName
        );

        setEmail(
            user.email
        );

        setPassword("");

        setRole(
            user.role
        );

        setIsActive(
            user.isActive
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // ========================================
    // Cancel Edit
    // ========================================
    const handleCancelEdit =
        () => {

            resetForm();

            setError("");
            setSuccess("");
        };


    // ========================================
    // Activate / Deactivate
    // ========================================
    const handleStatusChange =
        async (
            user: User
        ) => {

            setError("");
            setSuccess("");


            const newStatus =
                !user.isActive;


            try {
                setStatusLoadingId(
                    user.id
                );


                const result =
                    await changeUserStatus(
                        user.id,
                        newStatus
                    );


                setSuccess(
                    result.message
                );


                await loadUsers();

            } catch (
                err: unknown
            ) {
                console.error(
                    "User Status Error:",
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {
                    setError(
                        err.response
                            ?.data
                            ?.message ||
                            "Failed to change user status."
                    );

                } else {
                    setError(
                        "Failed to change user status."
                    );
                }

            } finally {
                setStatusLoadingId(
                    null
                );
            }
        };


    // ========================================
    // Loading
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />


                <main className="mx-auto max-w-6xl p-4 sm:p-6">

                    <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                        <p className="text-gray-600">
                            Loading users...
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <main className="mx-auto max-w-6xl p-4 sm:p-6">


                {/* ================================= */}
                {/* Header */}
                {/* ================================= */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                        <h1 className="text-2xl font-bold text-gray-800">
                            User Management
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            Manage Admin, Teacher and Student accounts
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/dashboard"
                            )
                        }
                        className="w-full rounded-md bg-gray-600 px-4 py-2.5 text-white hover:bg-gray-700 sm:w-auto"
                    >
                        Back to Dashboard
                    </button>

                </div>


                {/* ================================= */}
                {/* Create / Edit Form */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">

                        {editingId !==
                        null
                            ? "Edit User"
                            : "Create User"}

                    </h2>


                    {error && (
                        <div className="mb-4 break-words rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">

                            {error}

                        </div>
                    )}


                    {success && (
                        <div className="mb-4 break-words rounded bg-green-100 p-3 text-sm text-green-700 sm:text-base">

                            {success}

                        </div>
                    )}


                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            {/* Full Name */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Full Name{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <input
                                    id="fullName"
                                    type="text"
                                    value={
                                        fullName
                                    }
                                    maxLength={
                                        100
                                    }
                                    required
                                    onChange={(
                                        e
                                    ) =>
                                        setFullName(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Example: John Smith"
                                    className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                                />


                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum 100 characters
                                </p>

                            </div>


                            {/* Role */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="role"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Role{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="role"
                                    value={
                                        role
                                    }
                                    required
                                    onChange={(
                                        e
                                    ) =>
                                        setRole(
                                            e.target
                                                .value
                                        )
                                    }
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
                                >

                                    <option value="Admin">
                                        Admin
                                    </option>

                                    <option value="Teacher">
                                        Teacher
                                    </option>

                                    <option value="Student">
                                        Student
                                    </option>

                                </select>

                            </div>


                            {/* Email */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="email"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Email{" "}

                                    {editingId ===
                                        null && (

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    )}

                                </label>


                                <input
                                    id="email"
                                    type="email"
                                    value={
                                        email
                                    }
                                    maxLength={
                                        150
                                    }
                                    required={
                                        editingId ===
                                        null
                                    }
                                    disabled={
                                        editingId !==
                                        null
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEmail(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="user@example.com"
                                    className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />


                                {editingId !==
                                    null && (

                                    <p className="mt-1 text-xs text-gray-500">
                                        Email cannot be changed.
                                    </p>

                                )}

                            </div>


                            {/* Password */}
                            {editingId ===
                                null && (

                                <div className="min-w-0">

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Password{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="password"
                                        type="password"
                                        value={
                                            password
                                        }
                                        minLength={
                                            6
                                        }
                                        required
                                        onChange={(
                                            e
                                        ) =>
                                            setPassword(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Minimum 6 characters"
                                        className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                                    />


                                    <p className="mt-1 text-xs text-gray-500">
                                        Minimum 6 characters
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* Active - Edit only */}
                        {editingId !==
                            null && (

                            <div className="flex items-center gap-3">

                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={
                                        isActive
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setIsActive(
                                            e.target
                                                .checked
                                        )
                                    }
                                    className="h-4 w-4 shrink-0"
                                />


                                <label
                                    htmlFor="isActive"
                                    className="font-medium text-gray-700"
                                >
                                    Active User
                                </label>

                            </div>

                        )}


                        {/* Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="w-full rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                            >

                                {submitting
                                    ? "Saving..."
                                    : editingId !==
                                        null
                                      ? "Update User"
                                      : "Create User"}

                            </button>


                            {editingId !==
                                null && (

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="w-full rounded-md bg-gray-500 px-5 py-2.5 text-white hover:bg-gray-600 sm:w-auto"
                                >
                                    Cancel
                                </button>

                            )}

                        </div>

                    </form>

                </div>


                {/* ================================= */}
                {/* User List */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        User List
                    </h2>


                    {users.length === 0 ? (

                        <div className="rounded border border-dashed p-8 text-center text-gray-500">
                            No users found.
                        </div>

                    ) : (
                        <>


                            {/* ================================= */}
                            {/* MOBILE CARDS */}
                            {/* ================================= */}

                            <div className="space-y-4 md:hidden">

                                {users.map(
                                    (user) => (

                                        <div
                                            key={
                                                user.id
                                            }
                                            className="rounded-lg border border-gray-200 p-4"
                                        >


                                            <div className="mb-3 flex items-start justify-between gap-3">

                                                <div className="min-w-0">

                                                    <h3 className="break-words font-semibold text-gray-800">
                                                        {
                                                            user.fullName
                                                        }
                                                    </h3>


                                                    <p className="mt-1 break-all text-sm text-gray-500">
                                                        {
                                                            user.email
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    className={
                                                        user.isActive
                                                            ? "shrink-0 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                            : "shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                                                    }
                                                >
                                                    {user.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </div>


                                            <div className="space-y-2 text-sm text-gray-600">

                                                <p>
                                                    <strong>
                                                        ID:
                                                    </strong>{" "}

                                                    {
                                                        user.id
                                                    }
                                                </p>


                                                <p>
                                                    <strong>
                                                        Role:
                                                    </strong>{" "}

                                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                                        {
                                                            user.role
                                                        }
                                                    </span>
                                                </p>


                                                <p className="break-words">
                                                    <strong>
                                                        Created:
                                                    </strong>{" "}

                                                    {user.createdAt
                                                        ? new Date(
                                                              user.createdAt
                                                          ).toLocaleString()
                                                        : "-"}
                                                </p>

                                            </div>


                                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            user
                                                        )
                                                    }
                                                    className="w-full rounded bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600 sm:w-auto"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    disabled={
                                                        statusLoadingId ===
                                                        user.id
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            user
                                                        )
                                                    }
                                                    className={
                                                        user.isActive
                                                            ? "w-full rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:bg-red-300 sm:w-auto"
                                                            : "w-full rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:bg-green-300 sm:w-auto"
                                                    }
                                                >

                                                    {statusLoadingId ===
                                                    user.id
                                                        ? "Updating..."
                                                        : user.isActive
                                                          ? "Deactivate"
                                                          : "Activate"}

                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* ================================= */}
                            {/* TABLET / DESKTOP TABLE */}
                            {/* ================================= */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full min-w-[950px] border-collapse">

                                    <thead>

                                        <tr className="bg-gray-100 text-left">

                                            <th className="border p-3">
                                                ID
                                            </th>

                                            <th className="border p-3">
                                                Full Name
                                            </th>

                                            <th className="border p-3">
                                                Email
                                            </th>

                                            <th className="border p-3">
                                                Role
                                            </th>

                                            <th className="border p-3">
                                                Status
                                            </th>

                                            <th className="border p-3">
                                                Created
                                            </th>

                                            <th className="border p-3">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {users.map(
                                            (user) => (

                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >

                                                    <td className="border p-3">
                                                        {
                                                            user.id
                                                        }
                                                    </td>


                                                    <td className="border p-3 font-medium">
                                                        {
                                                            user.fullName
                                                        }
                                                    </td>


                                                    <td className="max-w-[250px] break-all border p-3">
                                                        {
                                                            user.email
                                                        }
                                                    </td>


                                                    <td className="border p-3">

                                                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-700">
                                                            {
                                                                user.role
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="border p-3">

                                                        {user.isActive ? (

                                                            <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                                                                Active
                                                            </span>

                                                        ) : (

                                                            <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-700">
                                                                Inactive
                                                            </span>

                                                        )}

                                                    </td>


                                                    <td className="border p-3 text-sm">

                                                        {user.createdAt
                                                            ? new Date(
                                                                  user.createdAt
                                                              ).toLocaleString()
                                                            : "-"}

                                                    </td>


                                                    <td className="border p-3">

                                                        <div className="flex flex-wrap gap-2">


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        user
                                                                    )
                                                                }
                                                                className="rounded bg-yellow-500 px-3 py-1.5 text-sm text-white hover:bg-yellow-600"
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    statusLoadingId ===
                                                                    user.id
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        user
                                                                    )
                                                                }
                                                                className={
                                                                    user.isActive
                                                                        ? "rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:bg-red-300"
                                                                        : "rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:bg-green-300"
                                                                }
                                                            >

                                                                {statusLoadingId ===
                                                                user.id
                                                                    ? "Updating..."
                                                                    : user.isActive
                                                                      ? "Deactivate"
                                                                      : "Activate"}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </>
                    )}

                </div>

            </main>

        </div>
    );
}
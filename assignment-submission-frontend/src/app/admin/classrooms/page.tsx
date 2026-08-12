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
    createClassRoom,
    getClassRooms,
    updateClassRoom,
    changeClassRoomStatus,
    type ClassRoom,
} from "@/services/classRoomService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function ClassRoomsPage() {
    const router = useRouter();


    // ========================================
    // Data
    // ========================================
    const [classRooms, setClassRooms] =
        useState<ClassRoom[]>([]);


    // ========================================
    // UI State
    // ========================================
    const [loading, setLoading] =
        useState<boolean>(true);

    const [submitting, setSubmitting] =
        useState<boolean>(false);

    const [
        statusLoadingId,
        setStatusLoadingId,
    ] =
        useState<number | null>(null);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string>("");

    const [success, setSuccess] =
        useState<string>("");


    // ========================================
    // Form Fields
    // ========================================
    const [name, setName] =
        useState<string>("");

    const [code, setCode] =
        useState<string>("");

    const [description, setDescription] =
        useState<string>("");

    const [isActive, setIsActive] =
        useState<boolean>(true);


    // ========================================
    // Load ClassRooms
    // ========================================
    const loadClassRooms =
        useCallback(async () => {

            try {
                const data =
                    await getClassRooms();

                setClassRooms(data);

            } catch (err) {
                console.error(
                    "ClassRoom Load Error:",
                    err
                );

                setError(
                    "Failed to load classrooms."
                );
            }

        }, []);


    // ========================================
    // Initial Page Load
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
                    const user:
                        LoggedInUser =
                        JSON.parse(
                            storedUser
                        );


                    if (
                        user.role !==
                        "Admin"
                    ) {
                        router.push(
                            "/dashboard"
                        );

                        return;
                    }


                    await loadClassRooms();

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
        loadClassRooms,
    ]);


    // ========================================
    // Reset Form
    // ========================================
    const resetForm = () => {
        setName("");
        setCode("");
        setDescription("");
        setIsActive(true);
        setEditingId(null);
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
                name.trim();

            const trimmedCode =
                code.trim();

            const trimmedDescription =
                description.trim();


            // ====================================
            // Validation
            // ====================================
            if (!trimmedName) {
                setError(
                    "Class/Course name is required."
                );

                return;
            }


            if (
                trimmedName.length >
                100
            ) {
                setError(
                    "Name cannot be more than 100 characters."
                );

                return;
            }


            if (
                trimmedCode.length >
                50
            ) {
                setError(
                    "Code cannot be more than 50 characters."
                );

                return;
            }


            if (
                trimmedDescription.length >
                200
            ) {
                setError(
                    "Description cannot be more than 200 characters."
                );

                return;
            }


            const requestData = {
                name:
                    trimmedName,

                code:
                    trimmedCode ||
                    undefined,

                description:
                    trimmedDescription ||
                    undefined,

                isActive,
            };


            try {
                setSubmitting(
                    true
                );


                // =================================
                // EDIT MODE
                // =================================
                if (
                    editingId !==
                    null
                ) {
                    await updateClassRoom(
                        editingId,
                        requestData
                    );


                    setSuccess(
                        "Class/Course updated successfully."
                    );
                }

                // =================================
                // CREATE MODE
                // =================================
                else {
                    await createClassRoom(
                        requestData
                    );


                    setSuccess(
                        "Class/Course created successfully."
                    );
                }


                resetForm();

                await loadClassRooms();

            } catch (
                err: unknown
            ) {
                console.error(
                    "ClassRoom Save Error:",
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {
                    const message =
                        err.response?.data
                            ?.message;


                    setError(
                        message ||
                            "Failed to save Class/Course."
                    );

                } else {
                    setError(
                        "Failed to save Class/Course."
                    );
                }

            } finally {
                setSubmitting(
                    false
                );
            }
        };


    // ========================================
    // Edit Button
    // ========================================
    const handleEdit = (
        classRoom: ClassRoom
    ) => {

        setError("");
        setSuccess("");


        setEditingId(
            classRoom.id
        );

        setName(
            classRoom.name
        );

        setCode(
            classRoom.code ??
                ""
        );

        setDescription(
            classRoom.description ??
                ""
        );

        setIsActive(
            classRoom.isActive
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
            classRoom: ClassRoom
        ) => {

            setError("");
            setSuccess("");


            const newStatus =
                !classRoom.isActive;


            try {
                setStatusLoadingId(
                    classRoom.id
                );


                const result =
                    await changeClassRoomStatus(
                        classRoom.id,
                        newStatus
                    );


                setSuccess(
                    result.message
                );


                await loadClassRooms();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Status Change Error:",
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {
                    const message =
                        err.response?.data
                            ?.message;


                    setError(
                        message ||
                            "Failed to change status."
                    );

                } else {
                    setError(
                        "Failed to change status."
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
                            Loading classrooms...
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
                            Class Rooms
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage class/course information
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/dashboard"
                            )
                        }
                        className="w-full rounded-md bg-gray-600 px-4 py-2.5 text-white transition hover:bg-gray-700 sm:w-auto"
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
                            ? "Edit Class / Course"
                            : "Create Class / Course"}

                    </h2>


                    {/* Error */}
                    {error && (

                        <div className="mb-4 break-words rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">

                            {error}

                        </div>

                    )}


                    {/* Success */}
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


                            {/* Name */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="name"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Name{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>


                                <input
                                    id="name"
                                    type="text"
                                    value={
                                        name
                                    }
                                    maxLength={
                                        100
                                    }
                                    required
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: Class 10"
                                    className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                />


                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum 100 characters
                                </p>

                            </div>


                            {/* Code */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="code"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Code
                                </label>


                                <input
                                    id="code"
                                    type="text"
                                    value={
                                        code
                                    }
                                    maxLength={
                                        50
                                    }
                                    onChange={(e) =>
                                        setCode(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: C10"
                                    className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                />


                                <p className="mt-1 text-xs text-gray-500">
                                    Optional. Must be unique if provided.
                                </p>

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* Description */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="description"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Description
                            </label>


                            <textarea
                                id="description"
                                value={
                                    description
                                }
                                rows={4}
                                maxLength={
                                    200
                                }
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter class/course description"
                                className="w-full min-w-0 resize-y rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                            />


                            <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500">

                                <span>
                                    Maximum 200 characters
                                </span>

                                <span>
                                    {
                                        description.length
                                    }
                                    /200
                                </span>

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* Active */}
                        {/* ================================= */}

                        <div className="flex items-center gap-3">

                            <input
                                id="isActive"
                                type="checkbox"
                                checked={
                                    isActive
                                }
                                onChange={(e) =>
                                    setIsActive(
                                        e.target.checked
                                    )
                                }
                                className="h-4 w-4 shrink-0"
                            />


                            <label
                                htmlFor="isActive"
                                className="font-medium text-gray-700"
                            >
                                Active
                            </label>

                        </div>


                        {/* ================================= */}
                        {/* Buttons */}
                        {/* ================================= */}

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="w-full rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                            >

                                {submitting
                                    ? "Saving..."
                                    : editingId !==
                                        null
                                      ? "Update Class / Course"
                                      : "Create Class / Course"}

                            </button>


                            {editingId !==
                                null && (

                                <button
                                    type="button"
                                    disabled={
                                        submitting
                                    }
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="w-full rounded-md bg-gray-500 px-5 py-2.5 text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Cancel
                                </button>

                            )}

                        </div>

                    </form>

                </div>


                {/* ================================= */}
                {/* Class / Course List */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        Class / Course List
                    </h2>


                    {classRooms.length ===
                    0 ? (

                        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            No classrooms found.
                        </div>

                    ) : (
                        <>


                            {/* ================================= */}
                            {/* MOBILE CARDS */}
                            {/* ================================= */}

                            <div className="space-y-4 md:hidden">

                                {classRooms.map(
                                    (
                                        classRoom
                                    ) => (

                                        <div
                                            key={
                                                classRoom.id
                                            }
                                            className="rounded-lg border border-gray-200 p-4"
                                        >


                                            <div className="mb-4 flex items-start justify-between gap-3">


                                                <div className="min-w-0">

                                                    <h3 className="break-words font-semibold text-gray-800">

                                                        {
                                                            classRoom.name
                                                        }

                                                    </h3>


                                                    <p className="mt-1 text-sm text-gray-500">

                                                        Code:{" "}

                                                        {
                                                            classRoom.code ||
                                                            "-"
                                                        }

                                                    </p>

                                                </div>


                                                <span
                                                    className={
                                                        classRoom.isActive
                                                            ? "shrink-0 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                            : "shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                                                    }
                                                >

                                                    {classRoom.isActive
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
                                                        classRoom.id
                                                    }
                                                </p>


                                                <div>

                                                    <strong>
                                                        Description:
                                                    </strong>

                                                    <p className="mt-1 whitespace-pre-wrap break-words">

                                                        {
                                                            classRoom.description ||
                                                            "-"
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Actions */}
                                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            classRoom
                                                        )
                                                    }
                                                    className="w-full rounded-md bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600 sm:w-auto"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    disabled={
                                                        statusLoadingId ===
                                                        classRoom.id
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            classRoom
                                                        )
                                                    }
                                                    className={
                                                        classRoom.isActive
                                                            ? "w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:bg-red-300 sm:w-auto"
                                                            : "w-full rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:bg-green-300 sm:w-auto"
                                                    }
                                                >

                                                    {statusLoadingId ===
                                                    classRoom.id
                                                        ? "Updating..."
                                                        : classRoom.isActive
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

                                <table className="w-full min-w-[850px] border-collapse">

                                    <thead>

                                        <tr className="bg-gray-100 text-left text-gray-700">

                                            <th className="border p-3">
                                                ID
                                            </th>

                                            <th className="border p-3">
                                                Name
                                            </th>

                                            <th className="border p-3">
                                                Code
                                            </th>

                                            <th className="border p-3">
                                                Description
                                            </th>

                                            <th className="border p-3">
                                                Status
                                            </th>

                                            <th className="border p-3">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {classRooms.map(
                                            (
                                                classRoom
                                            ) => (

                                                <tr
                                                    key={
                                                        classRoom.id
                                                    }
                                                    className="align-top hover:bg-gray-50"
                                                >


                                                    <td className="border p-3">
                                                        {
                                                            classRoom.id
                                                        }
                                                    </td>


                                                    <td className="border p-3 font-medium">
                                                        {
                                                            classRoom.name
                                                        }
                                                    </td>


                                                    <td className="border p-3">
                                                        {
                                                            classRoom.code ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td className="max-w-xs border p-3">

                                                        <p className="whitespace-pre-wrap break-words">

                                                            {
                                                                classRoom.description ||
                                                                "-"
                                                            }

                                                        </p>

                                                    </td>


                                                    <td className="border p-3">

                                                        {classRoom.isActive ? (

                                                            <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                                                                Active
                                                            </span>

                                                        ) : (

                                                            <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-700">
                                                                Inactive
                                                            </span>

                                                        )}

                                                    </td>


                                                    <td className="border p-3">

                                                        <div className="flex flex-wrap gap-2">


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        classRoom
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
                                                                    classRoom.id
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        classRoom
                                                                    )
                                                                }
                                                                className={
                                                                    classRoom.isActive
                                                                        ? "rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:bg-red-300"
                                                                        : "rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:bg-green-300"
                                                                }
                                                            >

                                                                {statusLoadingId ===
                                                                classRoom.id
                                                                    ? "Updating..."
                                                                    : classRoom.isActive
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
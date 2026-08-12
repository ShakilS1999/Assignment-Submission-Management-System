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
    getActiveTeachers,
    type User,
} from "@/services/userService";

import {
    getClassRooms,
    type ClassRoom,
} from "@/services/classRoomService";

import {
    getSubjects,
    type Subject,
} from "@/services/subjectService";

import {
    createTeacherClassSubject,
    deleteTeacherClassSubject,
    getTeacherClassSubjects,
    type TeacherClassSubject,
} from "@/services/teacherClassSubjectService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function TeacherClassSubjectsPage() {
    const router = useRouter();


    // ========================================
    // Data
    // ========================================
    const [teachers, setTeachers] =
        useState<User[]>([]);

    const [classRooms, setClassRooms] =
        useState<ClassRoom[]>([]);

    const [subjects, setSubjects] =
        useState<Subject[]>([]);

    const [assignments, setAssignments] =
        useState<TeacherClassSubject[]>([]);


    // ========================================
    // Form
    // ========================================
    const [teacherId, setTeacherId] =
        useState<string>("");

    const [classRoomId, setClassRoomId] =
        useState<string>("");

    const [subjectId, setSubjectId] =
        useState<string>("");


    // ========================================
    // UI State
    // ========================================
    const [loading, setLoading] =
        useState<boolean>(true);

    const [submitting, setSubmitting] =
        useState<boolean>(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string>("");

    const [success, setSuccess] =
        useState<string>("");


    // ========================================
    // Load Page Data
    // ========================================
    const loadData = useCallback(async () => {
        try {
            setError("");

            const [
                teacherData,
                classRoomData,
                subjectData,
                assignmentData,
            ] = await Promise.all([
                getActiveTeachers(),
                getClassRooms(),
                getSubjects(),
                getTeacherClassSubjects(),
            ]);


            setTeachers(
                teacherData
            );


            // Only active Class / Course
            setClassRooms(
                classRoomData.filter(
                    (item) =>
                        item.isActive
                )
            );


            // Only active Subject
            setSubjects(
                subjectData.filter(
                    (item) =>
                        item.isActive
                )
            );


            setAssignments(
                assignmentData
            );

        } catch (err) {
            console.error(
                "Teacher-Class-Subject Load Error:",
                err
            );

            setError(
                "Failed to load teacher assignment data."
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


                    await loadData();

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
        loadData,
    ]);


    // ========================================
    // Assign Teacher
    // ========================================
    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            setError("");
            setSuccess("");


            if (!teacherId) {
                setError(
                    "Please select a teacher."
                );

                return;
            }


            if (!classRoomId) {
                setError(
                    "Please select a Class/Course."
                );

                return;
            }


            if (!subjectId) {
                setError(
                    "Please select a subject."
                );

                return;
            }


            try {
                setSubmitting(
                    true
                );


                await createTeacherClassSubject({
                    teacherId:
                        Number(
                            teacherId
                        ),

                    classRoomId:
                        Number(
                            classRoomId
                        ),

                    subjectId:
                        Number(
                            subjectId
                        ),
                });


                setSuccess(
                    "Teacher assigned successfully."
                );


                // Reset Form
                setTeacherId("");
                setClassRoomId("");
                setSubjectId("");


                // Refresh List
                await loadData();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Teacher Assignment Error:",
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
                            "Failed to assign teacher."
                    );

                } else {
                    setError(
                        "Failed to assign teacher."
                    );
                }

            } finally {
                setSubmitting(
                    false
                );
            }
        };


    // ========================================
    // Remove Assignment
    // ========================================
    const handleRemove =
        async (
            assignment:
                TeacherClassSubject
        ) => {

            const confirmed =
                window.confirm(
                    `Remove ${assignment.teacherName} from ${assignment.classRoomName} - ${assignment.subjectName}?`
                );


            if (!confirmed) {
                return;
            }


            setError("");
            setSuccess("");


            try {
                setDeletingId(
                    assignment.id
                );


                const result =
                    await deleteTeacherClassSubject(
                        assignment.id
                    );


                setSuccess(
                    result.message
                );


                await loadData();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Teacher Assignment Remove Error:",
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
                            "Failed to remove teacher assignment."
                    );

                } else {
                    setError(
                        "Failed to remove teacher assignment."
                    );
                }

            } finally {
                setDeletingId(
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
                            Loading teacher assignments...
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
                            Teacher Class Subject
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            Assign teachers to classes/courses and subjects
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
                {/* Assignment Form */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        Assign Teacher
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


                        {/* ================================= */}
                        {/* Dropdowns */}
                        {/* ================================= */}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


                            {/* Teacher */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="teacher"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Teacher{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="teacher"
                                    value={
                                        teacherId
                                    }
                                    onChange={(e) =>
                                        setTeacherId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Teacher
                                    </option>


                                    {teachers.map(
                                        (
                                            teacher
                                        ) => (

                                            <option
                                                key={
                                                    teacher.id
                                                }
                                                value={
                                                    teacher.id
                                                }
                                            >
                                                {
                                                    teacher.fullName
                                                }
                                                {" - "}
                                                {
                                                    teacher.email
                                                }
                                            </option>

                                        )
                                    )}

                                </select>


                                {teachers.length ===
                                    0 && (

                                    <p className="mt-2 text-xs text-red-500">
                                        No active teachers found.
                                    </p>

                                )}

                            </div>


                            {/* Class / Course */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="classRoom"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Class / Course{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="classRoom"
                                    value={
                                        classRoomId
                                    }
                                    onChange={(e) =>
                                        setClassRoomId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Class / Course
                                    </option>


                                    {classRooms.map(
                                        (
                                            classRoom
                                        ) => (

                                            <option
                                                key={
                                                    classRoom.id
                                                }
                                                value={
                                                    classRoom.id
                                                }
                                            >

                                                {
                                                    classRoom.name
                                                }

                                                {classRoom.code
                                                    ? ` (${classRoom.code})`
                                                    : ""}

                                            </option>

                                        )
                                    )}

                                </select>


                                {classRooms.length ===
                                    0 && (

                                    <p className="mt-2 text-xs text-red-500">
                                        No active Class/Course found.
                                    </p>

                                )}

                            </div>


                            {/* Subject */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="subject"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Subject{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="subject"
                                    value={
                                        subjectId
                                    }
                                    onChange={(e) =>
                                        setSubjectId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Subject
                                    </option>


                                    {subjects.map(
                                        (
                                            subject
                                        ) => (

                                            <option
                                                key={
                                                    subject.id
                                                }
                                                value={
                                                    subject.id
                                                }
                                            >

                                                {
                                                    subject.name
                                                }

                                                {subject.code
                                                    ? ` (${subject.code})`
                                                    : ""}

                                            </option>

                                        )
                                    )}

                                </select>


                                {subjects.length ===
                                    0 && (

                                    <p className="mt-2 text-xs text-red-500">
                                        No active subjects found.
                                    </p>

                                )}

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* Assign Button */}
                        {/* ================================= */}

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                teachers.length ===
                                    0 ||
                                classRooms.length ===
                                    0 ||
                                subjects.length ===
                                    0
                            }
                            className="w-full rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                        >

                            {submitting
                                ? "Assigning..."
                                : "Assign Teacher"}

                        </button>

                    </form>

                </div>


                {/* ================================= */}
                {/* Existing Assignments */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        Teacher Assignments
                    </h2>


                    {assignments.length ===
                    0 ? (

                        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">

                            No teacher assignments found.

                        </div>

                    ) : (
                        <>


                            {/* ================================= */}
                            {/* MOBILE CARD VIEW */}
                            {/* ================================= */}

                            <div className="space-y-4 md:hidden">

                                {assignments.map(
                                    (
                                        assignment
                                    ) => (

                                        <div
                                            key={
                                                assignment.id
                                            }
                                            className="rounded-lg border border-gray-200 p-4"
                                        >


                                            <div className="space-y-3 text-sm text-gray-700">


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Teacher
                                                    </p>


                                                    <p className="mt-1 break-words font-semibold text-gray-800">

                                                        {
                                                            assignment.teacherName
                                                        }

                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Class / Course
                                                    </p>


                                                    <p className="mt-1 break-words">

                                                        {
                                                            assignment.classRoomName
                                                        }

                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Subject
                                                    </p>


                                                    <p className="mt-1 break-words">

                                                        {
                                                            assignment.subjectName
                                                        }

                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Assigned At
                                                    </p>


                                                    <p className="mt-1 break-words">

                                                        {new Date(
                                                            assignment.assignedAt
                                                        ).toLocaleString()}

                                                    </p>

                                                </div>


                                                <p>
                                                    <strong>
                                                        ID:
                                                    </strong>{" "}

                                                    {
                                                        assignment.id
                                                    }
                                                </p>

                                            </div>


                                            {/* Remove */}
                                            <button
                                                type="button"
                                                disabled={
                                                    deletingId ===
                                                    assignment.id
                                                }
                                                onClick={() =>
                                                    handleRemove(
                                                        assignment
                                                    )
                                                }
                                                className="mt-4 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                                            >

                                                {deletingId ===
                                                assignment.id
                                                    ? "Removing..."
                                                    : "Remove"}

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* ================================= */}
                            {/* TABLET / DESKTOP TABLE */}
                            {/* ================================= */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full min-w-[900px] border-collapse">

                                    <thead>

                                        <tr className="bg-gray-100 text-left text-gray-700">

                                            <th className="border p-3">
                                                ID
                                            </th>

                                            <th className="border p-3">
                                                Teacher
                                            </th>

                                            <th className="border p-3">
                                                Class / Course
                                            </th>

                                            <th className="border p-3">
                                                Subject
                                            </th>

                                            <th className="border p-3">
                                                Assigned At
                                            </th>

                                            <th className="border p-3">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {assignments.map(
                                            (
                                                assignment
                                            ) => (

                                                <tr
                                                    key={
                                                        assignment.id
                                                    }
                                                    className="align-top hover:bg-gray-50"
                                                >


                                                    <td className="border p-3">
                                                        {
                                                            assignment.id
                                                        }
                                                    </td>


                                                    <td className="max-w-[220px] break-words border p-3 font-medium">

                                                        {
                                                            assignment.teacherName
                                                        }

                                                    </td>


                                                    <td className="max-w-[220px] break-words border p-3">

                                                        {
                                                            assignment.classRoomName
                                                        }

                                                    </td>


                                                    <td className="max-w-[220px] break-words border p-3">

                                                        {
                                                            assignment.subjectName
                                                        }

                                                    </td>


                                                    <td className="border p-3">

                                                        {new Date(
                                                            assignment.assignedAt
                                                        ).toLocaleString()}

                                                    </td>


                                                    <td className="border p-3">

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingId ===
                                                                assignment.id
                                                            }
                                                            onClick={() =>
                                                                handleRemove(
                                                                    assignment
                                                                )
                                                            }
                                                            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                                                        >

                                                            {deletingId ===
                                                            assignment.id
                                                                ? "Removing..."
                                                                : "Remove"}

                                                        </button>

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
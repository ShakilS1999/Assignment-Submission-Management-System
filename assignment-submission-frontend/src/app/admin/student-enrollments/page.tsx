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
    getActiveStudents,
    type User,
} from "@/services/userService";

import {
    getClassRooms,
    type ClassRoom,
} from "@/services/classRoomService";

import {
    createStudentEnrollment,
    getStudentEnrollments,
    changeStudentEnrollmentStatus,
    type StudentEnrollment,
} from "@/services/studentEnrollmentService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function StudentEnrollmentsPage() {
    const router = useRouter();


    // ========================================
    // Data
    // ========================================
    const [students, setStudents] =
        useState<User[]>([]);

    const [classRooms, setClassRooms] =
        useState<ClassRoom[]>([]);

    const [enrollments, setEnrollments] =
        useState<StudentEnrollment[]>([]);


    // ========================================
    // Form
    // ========================================
    const [studentId, setStudentId] =
        useState<string>("");

    const [classRoomId, setClassRoomId] =
        useState<string>("");


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

    const [error, setError] =
        useState<string>("");

    const [success, setSuccess] =
        useState<string>("");


    // ========================================
    // Load Data
    // ========================================
    const loadData =
        useCallback(async () => {

            try {
                setError("");

                const [
                    studentData,
                    classRoomData,
                    enrollmentData,
                ] =
                    await Promise.all([
                        getActiveStudents(),
                        getClassRooms(),
                        getStudentEnrollments(),
                    ]);


                setStudents(
                    studentData
                );


                // Only active Class / Course
                setClassRooms(
                    classRoomData.filter(
                        (item) =>
                            item.isActive
                    )
                );


                setEnrollments(
                    enrollmentData
                );

            } catch (err) {
                console.error(
                    "Student Enrollment Load Error:",
                    err
                );

                setError(
                    "Failed to load student enrollment data."
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
    // Enroll Student
    // ========================================
    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            setError("");
            setSuccess("");


            if (!studentId) {
                setError(
                    "Please select a student."
                );

                return;
            }


            if (!classRoomId) {
                setError(
                    "Please select a Class/Course."
                );

                return;
            }


            try {
                setSubmitting(
                    true
                );


                await createStudentEnrollment({
                    studentId:
                        Number(
                            studentId
                        ),

                    classRoomId:
                        Number(
                            classRoomId
                        ),
                });


                setSuccess(
                    "Student enrolled successfully."
                );


                // Reset Form
                setStudentId("");
                setClassRoomId("");


                // Refresh List
                await loadData();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Student Enrollment Error:",
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
                            "Failed to enroll student."
                    );

                } else {
                    setError(
                        "Failed to enroll student."
                    );
                }

            } finally {
                setSubmitting(
                    false
                );
            }
        };


    // ========================================
    // Activate / Deactivate Enrollment
    // ========================================
    const handleStatusChange =
        async (
            enrollment:
                StudentEnrollment
        ) => {

            setError("");
            setSuccess("");


            const newStatus =
                !enrollment.isActive;


            try {
                setStatusLoadingId(
                    enrollment.id
                );


                const result =
                    await changeStudentEnrollmentStatus(
                        enrollment.id,
                        newStatus
                    );


                setSuccess(
                    result.message
                );


                await loadData();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Enrollment Status Error:",
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
                            "Failed to change enrollment status."
                    );

                } else {
                    setError(
                        "Failed to change enrollment status."
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
                            Loading student enrollments...
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
                            Student Enrollments
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            Enroll students into classes/courses
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
                {/* Enrollment Form */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        Enroll Student
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


                            {/* Student */}
                            <div className="min-w-0">

                                <label
                                    htmlFor="student"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Student{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="student"
                                    value={
                                        studentId
                                    }
                                    onChange={(e) =>
                                        setStudentId(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Student
                                    </option>


                                    {students.map(
                                        (
                                            student
                                        ) => (

                                            <option
                                                key={
                                                    student.id
                                                }
                                                value={
                                                    student.id
                                                }
                                            >
                                                {
                                                    student.fullName
                                                }
                                                {" - "}
                                                {
                                                    student.email
                                                }
                                            </option>

                                        )
                                    )}

                                </select>


                                {students.length ===
                                    0 && (

                                    <p className="mt-2 text-xs text-red-500">
                                        No active students found.
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

                        </div>


                        {/* Enroll Button */}
                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                students.length ===
                                    0 ||
                                classRooms.length ===
                                    0
                            }
                            className="w-full rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                        >

                            {submitting
                                ? "Enrolling..."
                                : "Enroll Student"}

                        </button>

                    </form>

                </div>


                {/* ================================= */}
                {/* Enrollment List */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">
                        Student Enrollment List
                    </h2>


                    {enrollments.length ===
                    0 ? (

                        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            No student enrollments found.
                        </div>

                    ) : (
                        <>


                            {/* ================================= */}
                            {/* MOBILE CARD VIEW */}
                            {/* ================================= */}

                            <div className="space-y-4 md:hidden">

                                {enrollments.map(
                                    (
                                        enrollment
                                    ) => (

                                        <div
                                            key={
                                                enrollment.id
                                            }
                                            className="rounded-lg border border-gray-200 p-4"
                                        >


                                            <div className="mb-4 flex items-start justify-between gap-3">

                                                <div className="min-w-0">

                                                    <h3 className="break-words font-semibold text-gray-800">

                                                        {
                                                            enrollment.studentName
                                                        }

                                                    </h3>


                                                    <p className="mt-1 break-all text-sm text-gray-500">

                                                        {
                                                            enrollment.studentEmail
                                                        }

                                                    </p>

                                                </div>


                                                <span
                                                    className={
                                                        enrollment.isActive
                                                            ? "shrink-0 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                            : "shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                                                    }
                                                >

                                                    {enrollment.isActive
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </div>


                                            <div className="space-y-3 text-sm text-gray-700">

                                                <p>
                                                    <strong>
                                                        ID:
                                                    </strong>{" "}

                                                    {
                                                        enrollment.id
                                                    }
                                                </p>


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Class / Course
                                                    </p>


                                                    <p className="mt-1 break-words">

                                                        {
                                                            enrollment.classRoomName
                                                        }

                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Enrolled At
                                                    </p>


                                                    <p className="mt-1 break-words">

                                                        {new Date(
                                                            enrollment.enrolledAt
                                                        ).toLocaleString()}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Status Button */}
                                            <button
                                                type="button"
                                                disabled={
                                                    statusLoadingId ===
                                                    enrollment.id
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        enrollment
                                                    )
                                                }
                                                className={
                                                    enrollment.isActive
                                                        ? "mt-4 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                                                        : "mt-4 w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                                                }
                                            >

                                                {statusLoadingId ===
                                                enrollment.id
                                                    ? "Updating..."
                                                    : enrollment.isActive
                                                      ? "Deactivate"
                                                      : "Activate"}

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* ================================= */}
                            {/* TABLET / DESKTOP TABLE */}
                            {/* ================================= */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full min-w-[1000px] border-collapse">

                                    <thead>

                                        <tr className="bg-gray-100 text-left text-gray-700">

                                            <th className="border p-3">
                                                ID
                                            </th>

                                            <th className="border p-3">
                                                Student
                                            </th>

                                            <th className="border p-3">
                                                Email
                                            </th>

                                            <th className="border p-3">
                                                Class / Course
                                            </th>

                                            <th className="border p-3">
                                                Status
                                            </th>

                                            <th className="border p-3">
                                                Enrolled At
                                            </th>

                                            <th className="border p-3">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {enrollments.map(
                                            (
                                                enrollment
                                            ) => (

                                                <tr
                                                    key={
                                                        enrollment.id
                                                    }
                                                    className="align-top hover:bg-gray-50"
                                                >


                                                    <td className="border p-3">
                                                        {
                                                            enrollment.id
                                                        }
                                                    </td>


                                                    <td className="max-w-[220px] break-words border p-3 font-medium">

                                                        {
                                                            enrollment.studentName
                                                        }

                                                    </td>


                                                    <td className="max-w-[260px] break-all border p-3">

                                                        {
                                                            enrollment.studentEmail
                                                        }

                                                    </td>


                                                    <td className="max-w-[220px] break-words border p-3">

                                                        {
                                                            enrollment.classRoomName
                                                        }

                                                    </td>


                                                    <td className="border p-3">

                                                        {enrollment.isActive ? (

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

                                                        {new Date(
                                                            enrollment.enrolledAt
                                                        ).toLocaleString()}

                                                    </td>


                                                    <td className="border p-3">

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                statusLoadingId ===
                                                                enrollment.id
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    enrollment
                                                                )
                                                            }
                                                            className={
                                                                enrollment.isActive
                                                                    ? "rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:bg-red-300"
                                                                    : "rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:bg-green-300"
                                                            }
                                                        >

                                                            {statusLoadingId ===
                                                            enrollment.id
                                                                ? "Updating..."
                                                                : enrollment.isActive
                                                                  ? "Deactivate"
                                                                  : "Activate"}

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
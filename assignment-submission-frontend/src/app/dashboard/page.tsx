"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";
import axios from "axios";

import Navbar from "@/components/Navbar";

import {
    deleteAssignment,
    getAssignmentsByRole,
    type Assignment,
} from "@/services/assignmentService";

import { getToken } from "@/utils/token";


interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function DashboardPage() {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    const [assignments, setAssignments] =
        useState<Assignment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================
    // LOAD ASSIGNMENTS
    // ========================================
    const loadAssignments = useCallback(
        async (role: string) => {
            const data =
                await getAssignmentsByRole(role);

            setAssignments(data);
        },
        []
    );


    // ========================================
    // INITIAL DASHBOARD LOAD
    // ========================================
    useEffect(() => {
        const loadDashboard = async () => {
            const token = getToken();

            if (!token) {
                router.push("/login");
                return;
            }


            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                router.push("/login");
                return;
            }


            try {
                const loggedInUser: User =
                    JSON.parse(storedUser);

                setUser(loggedInUser);

                await loadAssignments(
                    loggedInUser.role
                );

            } catch (err) {
                console.error(
                    "Dashboard Error:",
                    err
                );

                setError(
                    "Failed to load assignments."
                );

            } finally {
                setLoading(false);
            }
        };


        loadDashboard();

    }, [
        router,
        loadAssignments,
    ]);


    // ========================================
    // DELETE ASSIGNMENT - TEACHER ONLY
    // ========================================
    const handleDeleteAssignment = async (
        assignment: Assignment
    ) => {
        if (user?.role !== "Teacher") {
            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${assignment.title}"?`
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
                await deleteAssignment(
                    assignment.id
                );


            setSuccess(
                result.message ||
                    "Assignment deleted successfully."
            );


            await loadAssignments(
                "Teacher"
            );

        } catch (err: unknown) {
            console.error(
                "Delete Assignment Error:",
                err
            );


            if (
                axios.isAxiosError(err)
            ) {
                setError(
                    err.response?.data?.message ||
                        "Failed to delete assignment."
                );

            } else {
                setError(
                    "Failed to delete assignment."
                );
            }

        } finally {
            setDeletingId(null);
        }
    };


    // ========================================
    // LOADING
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <main className="mx-auto max-w-6xl p-4 sm:p-6">

                    <div className="rounded-lg bg-white p-6 shadow">

                        <p className="text-gray-600">
                            Loading dashboard...
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
                {/* USER INFORMATION */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                    <h1 className="mb-4 text-2xl font-bold text-gray-800">
                        Dashboard
                    </h1>


                    {user && (
                        <div className="space-y-1">

                            <h2 className="break-words text-lg font-semibold text-gray-800 sm:text-xl">
                                Welcome, {user.fullName}
                            </h2>


                            <p className="break-all text-sm text-gray-600 sm:text-base">
                                Email: {user.email}
                            </p>


                            <p className="text-sm text-gray-600 sm:text-base">
                                Role:{" "}

                                <span className="font-semibold text-blue-600">
                                    {user.role}
                                </span>
                            </p>

                        </div>
                    )}

                </div>


                {/* ================================= */}
                {/* ADMIN MANAGEMENT */}
                {/* ================================= */}

                {user?.role === "Admin" && (

                    <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                        <div className="mb-5">

                            <h2 className="text-xl font-bold text-gray-800">
                                Admin Management
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage users, academic setup, enrollments and submissions
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">


                            {/* User Management */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/users"
                                    )
                                }
                                className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-400 hover:bg-blue-100"
                            >

                                <h3 className="font-semibold text-blue-800">
                                    User Management
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Create and manage Admin, Teacher and Student users
                                </p>

                            </button>


                            {/* Class Rooms */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/classrooms"
                                    )
                                }
                                className="rounded-lg border border-green-200 bg-green-50 p-4 text-left transition hover:border-green-400 hover:bg-green-100"
                            >

                                <h3 className="font-semibold text-green-800">
                                    Class / Course Management
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Create and manage classes or courses
                                </p>

                            </button>


                            {/* Subjects */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/subjects"
                                    )
                                }
                                className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-left transition hover:border-purple-400 hover:bg-purple-100"
                            >

                                <h3 className="font-semibold text-purple-800">
                                    Subject Management
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Create and manage subjects
                                </p>

                            </button>


                            {/* Teacher Assignment */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/teacher-class-subjects"
                                    )
                                }
                                className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left transition hover:border-yellow-400 hover:bg-yellow-100"
                            >

                                <h3 className="font-semibold text-yellow-800">
                                    Teacher Assignments
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Assign teachers to classes and subjects
                                </p>

                            </button>


                            {/* Student Enrollment */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/student-enrollments"
                                    )
                                }
                                className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-100"
                            >

                                <h3 className="font-semibold text-cyan-800">
                                    Student Enrollments
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Enroll students into classes or courses
                                </p>

                            </button>


                            {/* All Submissions */}
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/submissions"
                                    )
                                }
                                className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-100"
                            >

                                <h3 className="font-semibold text-indigo-800">
                                    All Submissions
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    View all student assignment submissions
                                </p>

                            </button>

                        </div>

                    </div>

                )}


                {/* ================================= */}
                {/* ERROR MESSAGE */}
                {/* ================================= */}

                {error && (
                    <div className="mb-5 break-words rounded-md bg-red-100 p-3 text-sm text-red-700 sm:text-base">
                        {error}
                    </div>
                )}


                {/* ================================= */}
                {/* SUCCESS MESSAGE */}
                {/* ================================= */}

                {success && (
                    <div className="mb-5 break-words rounded-md bg-green-100 p-3 text-sm text-green-700 sm:text-base">
                        {success}
                    </div>
                )}


                {/* ================================= */}
                {/* ASSIGNMENTS */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">


                    {/* Assignment Header */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <h2 className="text-xl font-bold text-gray-800">

                            {user?.role === "Admin"
                                ? "All Assignments"
                                : user?.role === "Teacher"
                                  ? "My Assignments"
                                  : "Available Assignments"}

                        </h2>


                        {/* Teacher Create Button */}
                        {user?.role === "Teacher" && (

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/assignments/create"
                                    )
                                }
                                className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                            >
                                Create Assignment
                            </button>

                        )}

                    </div>


                    {/* No Assignments */}
                    {!error &&
                        assignments.length === 0 && (

                            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">

                                <p className="text-gray-500">
                                    No assignments found.
                                </p>

                            </div>

                        )}


                    {/* Assignment List */}
                    <div className="space-y-4">

                        {assignments.map(
                            (assignment) => (

                                <div
                                    key={
                                        assignment.id
                                    }
                                    className="rounded-lg border border-gray-200 p-4 transition hover:shadow-sm sm:p-5"
                                >


                                    <h3 className="break-words text-lg font-bold text-gray-800">
                                        {assignment.title}
                                    </h3>


                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 sm:text-base">
                                        {assignment.description}
                                    </p>


                                    {/* Assignment Information */}
                                    <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">

                                        <p className="break-words">
                                            <strong>
                                                Deadline:
                                            </strong>{" "}

                                            {new Date(
                                                assignment.deadline
                                            ).toLocaleString()}
                                        </p>


                                        <p>
                                            <strong>
                                                Maximum Marks:
                                            </strong>{" "}

                                            {
                                                assignment.maximumMarks
                                            }
                                        </p>


                                        {assignment.classRoomName && (

                                            <p className="break-words">
                                                <strong>
                                                    Class:
                                                </strong>{" "}

                                                {
                                                    assignment.classRoomName
                                                }
                                            </p>

                                        )}


                                        {assignment.subjectName && (

                                            <p className="break-words">
                                                <strong>
                                                    Subject:
                                                </strong>{" "}

                                                {
                                                    assignment.subjectName
                                                }
                                            </p>

                                        )}


                                        {assignment.teacherName && (

                                            <p className="break-words">
                                                <strong>
                                                    Teacher:
                                                </strong>{" "}

                                                {
                                                    assignment.teacherName
                                                }
                                            </p>

                                        )}


                                        {user?.role === "Teacher" && (

                                            <p>
                                                <strong>
                                                    Publish Status:
                                                </strong>{" "}

                                                <span
                                                    className={
                                                        assignment.isPublished
                                                            ? "inline-block rounded bg-green-100 px-2 py-0.5 font-semibold text-green-700"
                                                            : "inline-block rounded bg-orange-100 px-2 py-0.5 font-semibold text-orange-700"
                                                    }
                                                >
                                                    {assignment.isPublished
                                                        ? "Published"
                                                        : "Draft"}
                                                </span>
                                            </p>

                                        )}

                                    </div>


                                    {/* Student Action */}
                                    {user?.role === "Student" && (

                                        <div className="mt-5">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/assignments/${assignment.id}`
                                                    )
                                                }
                                                className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                                            >
                                                View / Submit Assignment
                                            </button>

                                        </div>

                                    )}


                                    {/* Teacher Actions */}
                                    {user?.role === "Teacher" && (

                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/assignments/${assignment.id}/edit`
                                                    )
                                                }
                                                className="w-full rounded-md bg-yellow-500 px-4 py-2.5 font-medium text-white transition hover:bg-yellow-600 sm:w-auto"
                                            >
                                                Edit
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/assignments/${assignment.id}/submissions`
                                                    )
                                                }
                                                className="w-full rounded-md bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 sm:w-auto"
                                            >
                                                View Submissions
                                            </button>


                                            <button
                                                type="button"
                                                disabled={
                                                    deletingId ===
                                                    assignment.id
                                                }
                                                onClick={() =>
                                                    handleDeleteAssignment(
                                                        assignment
                                                    )
                                                }
                                                className="w-full rounded-md bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 sm:w-auto"
                                            >

                                                {deletingId ===
                                                assignment.id
                                                    ? "Deleting..."
                                                    : "Delete"}

                                            </button>

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}
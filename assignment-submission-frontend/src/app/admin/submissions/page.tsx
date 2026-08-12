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
    getAllSubmissions,
    type AdminSubmission,
} from "@/services/submissionService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


// ========================================
// Status Color
// ========================================
const getStatusClass = (
    status: string
) => {
    if (status === "Reviewed") {
        return "bg-green-100 text-green-700";
    }

    if (status === "NeedsRevision") {
        return "bg-orange-100 text-orange-700";
    }

    return "bg-blue-100 text-blue-700";
};


export default function AdminSubmissionsPage() {
    const router = useRouter();

    const [
        submissions,
        setSubmissions,
    ] = useState<AdminSubmission[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ========================================
    // Load Submissions
    // ========================================
    const loadSubmissions =
        useCallback(async () => {

            try {
                setError("");

                const data =
                    await getAllSubmissions();

                setSubmissions(data);

            } catch (err: unknown) {

                console.error(
                    "Admin Submissions Error:",
                    err
                );

                if (
                    axios.isAxiosError(err)
                ) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load submissions."
                    );
                } else {
                    setError(
                        "Failed to load submissions."
                    );
                }
            }

        }, []);


    // ========================================
    // Admin Protection + Initial Load
    // ========================================
    useEffect(() => {

        const initializePage =
            async () => {

                const token =
                    getToken();

                if (!token) {
                    router.push("/login");
                    return;
                }


                const storedUser =
                    localStorage.getItem(
                        "user"
                    );

                if (!storedUser) {
                    router.push("/login");
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


                    await loadSubmissions();

                } catch {
                    router.push(
                        "/login"
                    );

                } finally {
                    setLoading(false);
                }
            };


        initializePage();

    }, [
        router,
        loadSubmissions,
    ]);


    // ========================================
    // Loading
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="p-6">
                    <p className="text-gray-600">
                        Loading submissions...
                    </p>
                </div>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <main className="mx-auto max-w-7xl p-4 sm:p-6">


                {/* ================================= */}
                {/* Header */}
                {/* ================================= */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            All Submissions
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View all student assignment submissions
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/dashboard"
                            )
                        }
                        className="w-full rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 sm:w-auto"
                    >
                        Back to Dashboard
                    </button>

                </div>


                {/* ================================= */}
                {/* Summary */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-5 shadow">

                    <p className="text-gray-600">
                        Total Submissions
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-600">
                        {submissions.length}
                    </p>

                </div>


                {/* ================================= */}
                {/* Error */}
                {/* ================================= */}

                {error && (
                    <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* ================================= */}
                {/* No Submissions */}
                {/* ================================= */}

                {!error &&
                    submissions.length === 0 && (

                    <div className="rounded-lg bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No submissions found.
                        </p>

                    </div>
                )}


                {/* ================================= */}
                {/* MOBILE VIEW */}
                {/* ================================= */}

                {submissions.length > 0 && (

                    <div className="space-y-4 md:hidden">

                        {submissions.map(
                            (submission) => (

                                <div
                                    key={
                                        submission.id
                                    }
                                    className="rounded-lg bg-white p-5 shadow"
                                >

                                    <div className="mb-4 flex items-start justify-between gap-3">

                                        <div>

                                            <h2 className="font-bold text-gray-800">
                                                {
                                                    submission.assignmentTitle
                                                }
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Submission ID:{" "}
                                                {
                                                    submission.id
                                                }
                                            </p>

                                        </div>


                                        <span
                                            className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${getStatusClass(
                                                submission.status
                                            )}`}
                                        >
                                            {
                                                submission.status
                                            }
                                        </span>

                                    </div>


                                    <div className="space-y-3 text-sm">

                                        <div>
                                            <p className="font-semibold text-gray-700">
                                                Student
                                            </p>

                                            <p className="break-words text-gray-600">
                                                {
                                                    submission.studentName
                                                }
                                            </p>

                                            <p className="break-all text-gray-500">
                                                {
                                                    submission.studentEmail
                                                }
                                            </p>
                                        </div>


                                        <div>
                                            <p className="font-semibold text-gray-700">
                                                Answer
                                            </p>

                                            <p className="whitespace-pre-wrap break-words text-gray-600">
                                                {
                                                    submission.answer
                                                }
                                            </p>
                                        </div>


                                        <div className="grid grid-cols-2 gap-3">

                                            <div>
                                                <p className="font-semibold text-gray-700">
                                                    Marks
                                                </p>

                                                <p className="text-gray-600">
                                                    {submission.marks ??
                                                        "-"}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="font-semibold text-gray-700">
                                                    Submitted
                                                </p>

                                                <p className="text-gray-600">
                                                    {new Date(
                                                        submission.submittedAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                        </div>


                                        <div>
                                            <p className="font-semibold text-gray-700">
                                                Feedback
                                            </p>

                                            <p className="whitespace-pre-wrap break-words text-gray-600">
                                                {submission.feedback ||
                                                    "-"}
                                            </p>
                                        </div>


                                        {submission.updatedAt && (
                                            <div>
                                                <p className="font-semibold text-gray-700">
                                                    Updated
                                                </p>

                                                <p className="text-gray-600">
                                                    {new Date(
                                                        submission.updatedAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        )}


                                        {submission.reviewedAt && (
                                            <div>
                                                <p className="font-semibold text-gray-700">
                                                    Reviewed
                                                </p>

                                                <p className="text-gray-600">
                                                    {new Date(
                                                        submission.reviewedAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* ================================= */}
                {/* TABLET / DESKTOP VIEW */}
                {/* ================================= */}

                {submissions.length > 0 && (

                    <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1100px] border-collapse text-sm">

                                <thead>

                                    <tr className="bg-gray-100 text-left text-gray-700">

                                        <th className="border-b p-3">
                                            ID
                                        </th>

                                        <th className="border-b p-3">
                                            Assignment
                                        </th>

                                        <th className="border-b p-3">
                                            Student
                                        </th>

                                        <th className="border-b p-3">
                                            Answer
                                        </th>

                                        <th className="border-b p-3">
                                            Status
                                        </th>

                                        <th className="border-b p-3">
                                            Marks
                                        </th>

                                        <th className="border-b p-3">
                                            Feedback
                                        </th>

                                        <th className="border-b p-3">
                                            Submitted
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {submissions.map(
                                        (submission) => (

                                            <tr
                                                key={
                                                    submission.id
                                                }
                                                className="align-top hover:bg-gray-50"
                                            >

                                                <td className="border-b p-3">
                                                    {
                                                        submission.id
                                                    }
                                                </td>


                                                <td className="border-b p-3">

                                                    <p className="font-medium text-gray-800">
                                                        {
                                                            submission.assignmentTitle
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        ID:{" "}
                                                        {
                                                            submission.assignmentId
                                                        }
                                                    </p>

                                                </td>


                                                <td className="border-b p-3">

                                                    <p className="font-medium text-gray-800">
                                                        {
                                                            submission.studentName
                                                        }
                                                    </p>

                                                    <p className="mt-1 break-all text-xs text-gray-500">
                                                        {
                                                            submission.studentEmail
                                                        }
                                                    </p>

                                                </td>


                                                <td className="max-w-xs border-b p-3">

                                                    <p className="whitespace-pre-wrap break-words text-gray-700">
                                                        {
                                                            submission.answer
                                                        }
                                                    </p>

                                                </td>


                                                <td className="border-b p-3">

                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${getStatusClass(
                                                            submission.status
                                                        )}`}
                                                    >
                                                        {
                                                            submission.status
                                                        }
                                                    </span>

                                                </td>


                                                <td className="border-b p-3">

                                                    {submission.marks ??
                                                        "-"}

                                                </td>


                                                <td className="max-w-xs border-b p-3">

                                                    <p className="whitespace-pre-wrap break-words text-gray-700">
                                                        {
                                                            submission.feedback ||
                                                            "-"
                                                        }
                                                    </p>

                                                </td>


                                                <td className="border-b p-3">

                                                    {new Date(
                                                        submission.submittedAt
                                                    ).toLocaleString()}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}
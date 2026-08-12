"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import axios from "axios";

import Navbar from "@/components/Navbar";

import {
    getAssignmentById,
    type Assignment,
} from "@/services/assignmentService";

import {
    getAssignmentSubmissions,
    reviewSubmission,
    type TeacherSubmission,
} from "@/services/submissionService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


interface ReviewFormState {
    marks: string;
    feedback: string;
    status:
        | "Submitted"
        | "Reviewed"
        | "NeedsRevision";
}


export default function AssignmentSubmissionsPage() {
    const router = useRouter();
    const params = useParams();

    const assignmentId =
        Number(params.id);


    // ========================================
    // Data
    // ========================================

    const [
        assignment,
        setAssignment,
    ] =
        useState<Assignment | null>(
            null
        );

    const [
        submissions,
        setSubmissions,
    ] =
        useState<TeacherSubmission[]>(
            []
        );

    const [
        reviewForms,
        setReviewForms,
    ] =
        useState<
            Record<
                number,
                ReviewFormState
            >
        >({});


    // ========================================
    // UI State
    // ========================================

    const [
        loading,
        setLoading,
    ] =
        useState<boolean>(
            true
        );

    const [
        reviewingId,
        setReviewingId,
    ] =
        useState<number | null>(
            null
        );

    const [
        error,
        setError,
    ] =
        useState<string>("");

    const [
        success,
        setSuccess,
    ] =
        useState<string>("");


    // ========================================
    // Load Assignment + Submissions
    // ========================================

    const loadData =
        async () => {

            try {
                setError("");


                const [
                    assignmentData,
                    submissionData,
                ] =
                    await Promise.all([
                        getAssignmentById(
                            assignmentId
                        ),

                        getAssignmentSubmissions(
                            assignmentId
                        ),
                    ]);


                setAssignment(
                    assignmentData
                );

                setSubmissions(
                    submissionData
                );


                // Existing Review Information
                const formData:
                    Record<
                        number,
                        ReviewFormState
                    > = {};


                submissionData.forEach(
                    (
                        submission
                    ) => {

                        formData[
                            submission.id
                        ] = {
                            marks:
                                submission.marks !==
                                null
                                    ? String(
                                          submission.marks
                                      )
                                    : "",

                            feedback:
                                submission.feedback ??
                                "",

                            status:
                                submission.status ===
                                    "Reviewed" ||
                                submission.status ===
                                    "NeedsRevision"
                                    ? submission.status
                                    : "Submitted",
                        };
                    }
                );


                setReviewForms(
                    formData
                );

            } catch (
                err: unknown
            ) {
                console.error(
                    "Submission Load Error:",
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
                            "Failed to load submissions."
                    );

                } else {
                    setError(
                        "Failed to load submissions."
                    );
                }
            }
        };


    // ========================================
    // Initial Load
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


                if (
                    !Number.isInteger(
                        assignmentId
                    ) ||
                    assignmentId <= 0
                ) {
                    setError(
                        "Invalid assignment ID."
                    );

                    setLoading(
                        false
                    );

                    return;
                }


                try {
                    const user:
                        LoggedInUser =
                        JSON.parse(
                            storedUser
                        );


                    // Teacher only
                    if (
                        user.role !==
                        "Teacher"
                    ) {
                        router.push(
                            "/dashboard"
                        );

                        return;
                    }


                    await loadData();

                } finally {
                    setLoading(
                        false
                    );
                }
            };


        initializePage();

    }, [
        assignmentId,
        router,
    ]);


    // ========================================
    // Change Review Form
    // ========================================

    const updateReviewForm = (
        submissionId: number,
        field:
            | "marks"
            | "feedback"
            | "status",
        value: string
    ) => {

        setReviewForms(
            (
                previous
            ) => ({
                ...previous,

                [submissionId]: {
                    ...previous[
                        submissionId
                    ],

                    [field]:
                        value,
                },
            })
        );
    };


    // ========================================
    // Review Submission
    // ========================================

    const handleReview =
        async (
            submission:
                TeacherSubmission
        ) => {

            setError("");
            setSuccess("");


            if (!assignment) {
                setError(
                    "Assignment information is unavailable."
                );

                return;
            }


            const form =
                reviewForms[
                    submission.id
                ];


            if (!form) {
                setError(
                    "Review information is unavailable."
                );

                return;
            }


            if (
                form.marks.trim() ===
                ""
            ) {
                setError(
                    "Marks are required."
                );

                return;
            }


            const marks =
                Number(
                    form.marks
                );


            if (
                !Number.isInteger(
                    marks
                ) ||
                marks < 0
            ) {
                setError(
                    "Marks must be 0 or greater."
                );

                return;
            }


            if (
                marks >
                assignment.maximumMarks
            ) {
                setError(
                    `Marks cannot exceed maximum marks (${assignment.maximumMarks}).`
                );

                return;
            }


            try {
                setReviewingId(
                    submission.id
                );


                const result =
                    await reviewSubmission(
                        submission.id,
                        {
                            marks,

                            feedback:
                                form.feedback.trim() ||
                                undefined,

                            status:
                                form.status,
                        }
                    );


                setSuccess(
                    result.message ||
                        "Submission reviewed successfully."
                );


                await loadData();

            } catch (
                err: unknown
            ) {
                console.error(
                    "Review Submission Error:",
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
                            "Failed to review submission."
                    );

                } else {
                    setError(
                        "Failed to review submission."
                    );
                }

            } finally {
                setReviewingId(
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
                            Loading submissions...
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

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                        <h1 className="text-2xl font-bold text-gray-800">
                            Student Submissions
                        </h1>


                        {assignment && (

                            <p className="mt-1 break-words text-sm leading-6 text-gray-600 sm:text-base">

                                {assignment.title}

                                {" — "}

                                {assignment.classRoomName}

                                {" — "}

                                {assignment.subjectName}

                            </p>

                        )}

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/dashboard"
                            )
                        }
                        className="w-full shrink-0 rounded-md bg-gray-600 px-4 py-2.5 text-white transition hover:bg-gray-700 sm:w-auto"
                    >
                        Back to Dashboard
                    </button>

                </div>


                {/* ================================= */}
                {/* Assignment Info */}
                {/* ================================= */}

                {assignment && (

                    <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-5">

                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:text-base md:grid-cols-3">


                            <p>

                                <strong>
                                    Maximum Marks:
                                </strong>{" "}

                                {
                                    assignment.maximumMarks
                                }

                            </p>


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
                                    Total Submissions:
                                </strong>{" "}

                                {
                                    submissions.length
                                }

                            </p>

                        </div>

                    </div>

                )}


                {/* ================================= */}
                {/* Messages */}
                {/* ================================= */}

                {error && (

                    <div className="mb-5 break-words rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">

                        {error}

                    </div>

                )}


                {success && (

                    <div className="mb-5 break-words rounded bg-green-100 p-3 text-sm text-green-700 sm:text-base">

                        {success}

                    </div>

                )}


                {/* ================================= */}
                {/* No Submissions */}
                {/* ================================= */}

                {submissions.length ===
                0 ? (

                    <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow sm:p-8">

                        No student submissions found.

                    </div>

                ) : (

                    <div className="space-y-6">


                        {submissions.map(
                            (
                                submission
                            ) => {

                                const form =
                                    reviewForms[
                                        submission.id
                                    ];


                                return (

                                    <div
                                        key={
                                            submission.id
                                        }
                                        className="rounded-lg bg-white p-4 shadow sm:p-6"
                                    >


                                        {/* ================================= */}
                                        {/* Student Info */}
                                        {/* ================================= */}

                                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">


                                            <div className="min-w-0">

                                                <h2 className="break-words text-lg font-bold text-gray-800">

                                                    {
                                                        submission.studentName
                                                    }

                                                </h2>


                                                <p className="mt-1 break-all text-sm text-gray-500">

                                                    {
                                                        submission.studentEmail
                                                    }

                                                </p>

                                            </div>


                                            <span
                                                className={
                                                    submission.status ===
                                                    "Reviewed"
                                                        ? "w-fit shrink-0 rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                                                        : submission.status ===
                                                            "NeedsRevision"
                                                          ? "w-fit shrink-0 rounded bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700"
                                                          : "w-fit shrink-0 rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                                                }
                                            >

                                                {
                                                    submission.status
                                                }

                                            </span>

                                        </div>


                                        {/* ================================= */}
                                        {/* Student Answer */}
                                        {/* ================================= */}

                                        <div className="mb-5">

                                            <h3 className="mb-2 font-semibold text-gray-800">
                                                Student Answer
                                            </h3>


                                            <div className="whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 sm:text-base">

                                                {
                                                    submission.answer
                                                }

                                            </div>

                                        </div>


                                        {/* ================================= */}
                                        {/* Submission Times */}
                                        {/* ================================= */}

                                        <div className="mb-5 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">


                                            <p className="break-words">

                                                <strong>
                                                    Submitted:
                                                </strong>{" "}

                                                {new Date(
                                                    submission.submittedAt
                                                ).toLocaleString()}

                                            </p>


                                            {submission.updatedAt && (

                                                <p className="break-words">

                                                    <strong>
                                                        Updated:
                                                    </strong>{" "}

                                                    {new Date(
                                                        submission.updatedAt
                                                    ).toLocaleString()}

                                                </p>

                                            )}

                                        </div>


                                        {/* ================================= */}
                                        {/* Review Form */}
                                        {/* ================================= */}

                                        {form && (

                                            <div className="rounded-md border border-gray-200 p-4 sm:p-5">

                                                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                                                    Review Submission
                                                </h3>


                                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                                                    {/* ================================= */}
                                                    {/* Marks */}
                                                    {/* ================================= */}

                                                    <div className="min-w-0">

                                                        <label
                                                            htmlFor={`marks-${submission.id}`}
                                                            className="mb-2 block font-medium text-gray-700"
                                                        >
                                                            Marks
                                                        </label>


                                                        <input
                                                            id={`marks-${submission.id}`}
                                                            type="number"
                                                            min={0}
                                                            max={
                                                                assignment?.maximumMarks ??
                                                                1000
                                                            }
                                                            value={
                                                                form.marks
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateReviewForm(
                                                                    submission.id,
                                                                    "marks",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                                        />


                                                        <p className="mt-1 text-xs text-gray-500">

                                                            Maximum:{" "}

                                                            {
                                                                assignment?.maximumMarks
                                                            }

                                                        </p>

                                                    </div>


                                                    {/* ================================= */}
                                                    {/* Status */}
                                                    {/* ================================= */}

                                                    <div className="min-w-0">

                                                        <label
                                                            htmlFor={`status-${submission.id}`}
                                                            className="mb-2 block font-medium text-gray-700"
                                                        >
                                                            Status
                                                        </label>


                                                        <select
                                                            id={`status-${submission.id}`}
                                                            value={
                                                                form.status
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateReviewForm(
                                                                    submission.id,
                                                                    "status",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                                        >

                                                            <option value="Submitted">
                                                                Submitted
                                                            </option>

                                                            <option value="Reviewed">
                                                                Reviewed
                                                            </option>

                                                            <option value="NeedsRevision">
                                                                Needs Revision
                                                            </option>

                                                        </select>

                                                    </div>

                                                </div>


                                                {/* ================================= */}
                                                {/* Feedback */}
                                                {/* ================================= */}

                                                <div className="mt-5">

                                                    <label
                                                        htmlFor={`feedback-${submission.id}`}
                                                        className="mb-2 block font-medium text-gray-700"
                                                    >
                                                        Feedback
                                                    </label>


                                                    <textarea
                                                        id={`feedback-${submission.id}`}
                                                        rows={4}
                                                        value={
                                                            form.feedback
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateReviewForm(
                                                                submission.id,
                                                                "feedback",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Write feedback for the student..."
                                                        className="w-full min-w-0 resize-y rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 sm:text-base"
                                                    />

                                                </div>


                                                {/* ================================= */}
                                                {/* Save Review */}
                                                {/* ================================= */}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        reviewingId ===
                                                        submission.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(
                                                            submission
                                                        )
                                                    }
                                                    className="mt-5 w-full rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                                                >

                                                    {reviewingId ===
                                                    submission.id
                                                        ? "Saving Review..."
                                                        : "Save Review"}

                                                </button>

                                            </div>

                                        )}

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </main>

        </div>
    );
}
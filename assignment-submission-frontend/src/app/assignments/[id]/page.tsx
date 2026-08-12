"use client";

import {
    useEffect,
    useState,
    type FormEvent,
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
    createSubmission,
    getMySubmissions,
    updateSubmission,
    type MySubmission,
} from "@/services/submissionService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function AssignmentDetailsPage() {
    const router = useRouter();

    const params =
        useParams();

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
        submission,
        setSubmission,
    ] =
        useState<MySubmission | null>(
            null
        );

    const [
        answer,
        setAnswer,
    ] =
        useState<string>("");


    // ========================================
    // UI State
    // ========================================

    const [
        loading,
        setLoading,
    ] =
        useState<boolean>(true);

    const [
        submitting,
        setSubmitting,
    ] =
        useState<boolean>(false);

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
    // Load Assignment + Existing Submission
    // ========================================

    useEffect(() => {
        const loadPage =
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


                    // Student only
                    if (
                        user.role !==
                        "Student"
                    ) {
                        router.push(
                            "/dashboard"
                        );

                        return;
                    }


                    const [
                        assignmentData,
                        submissionData,
                    ] =
                        await Promise.all([
                            getAssignmentById(
                                assignmentId
                            ),

                            getMySubmissions(),
                        ]);


                    setAssignment(
                        assignmentData
                    );


                    const existingSubmission =
                        submissionData.find(
                            (item) =>
                                item.assignmentId ===
                                assignmentId
                        ) ?? null;


                    setSubmission(
                        existingSubmission
                    );


                    if (
                        existingSubmission
                    ) {
                        setAnswer(
                            existingSubmission.answer
                        );
                    }

                } catch (
                    err: unknown
                ) {
                    console.error(
                        "Assignment Details Error:",
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
                                "Failed to load assignment."
                        );

                    } else {
                        setError(
                            "Failed to load assignment."
                        );
                    }

                } finally {
                    setLoading(
                        false
                    );
                }
            };


        loadPage();

    }, [
        assignmentId,
        router,
    ]);


    // ========================================
    // Submit / Update
    // ========================================

    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();


            setError("");
            setSuccess("");


            const trimmedAnswer =
                answer.trim();


            if (!trimmedAnswer) {
                setError(
                    "Answer is required."
                );

                return;
            }


            if (!assignment) {
                setError(
                    "Assignment information is unavailable."
                );

                return;
            }


            const deadline =
                new Date(
                    assignment.deadline
                );


            if (
                deadline.getTime() <
                Date.now()
            ) {
                setError(
                    "The submission deadline has passed."
                );

                return;
            }


            try {
                setSubmitting(
                    true
                );


                // =================================
                // Update Existing Submission
                // =================================

                if (submission) {

                    if (
                        !assignment.allowSubmissionUpdate
                    ) {
                        setError(
                            "Updating this submission is not allowed."
                        );

                        return;
                    }


                    await updateSubmission(
                        submission.id,
                        {
                            answer:
                                trimmedAnswer,
                        }
                    );


                    setSuccess(
                        "Submission updated successfully."
                    );
                }

                // =================================
                // Create New Submission
                // =================================

                else {

                    await createSubmission(
                        {
                            assignmentId:
                                assignment.id,

                            answer:
                                trimmedAnswer,
                        }
                    );


                    setSuccess(
                        "Assignment submitted successfully."
                    );
                }


                // =================================
                // Reload Submission
                // =================================

                const submissions =
                    await getMySubmissions();


                const updatedSubmission =
                    submissions.find(
                        (item) =>
                            item.assignmentId ===
                            assignment.id
                    ) ?? null;


                setSubmission(
                    updatedSubmission
                );


                if (
                    updatedSubmission
                ) {
                    setAnswer(
                        updatedSubmission.answer
                    );
                }

            } catch (
                err: unknown
            ) {
                console.error(
                    "Submission Error:",
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
                            "Failed to save submission."
                    );

                } else {
                    setError(
                        "Failed to save submission."
                    );
                }

            } finally {
                setSubmitting(
                    false
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


                <main className="mx-auto max-w-5xl p-4 sm:p-6">

                    <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                        <p className="text-gray-600">
                            Loading assignment...
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    // ========================================
    // No Assignment
    // ========================================

    if (!assignment) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />


                <main className="mx-auto max-w-5xl p-4 sm:p-6">

                    <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                        <div className="break-words rounded bg-red-100 p-4 text-red-700">

                            {error ||
                                "Assignment not found."}

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/dashboard"
                                )
                            }
                            className="mt-5 w-full rounded-md bg-gray-600 px-4 py-2.5 text-white hover:bg-gray-700 sm:w-auto"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // ========================================
    // Submission Rules
    // ========================================

    const deadlinePassed =
        new Date(
            assignment.deadline
        ).getTime() <
        Date.now();


    const canUpdate =
        !deadlinePassed &&
        assignment.allowSubmissionUpdate ===
            true;


    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <main className="mx-auto max-w-5xl p-4 sm:p-6">


                {/* ================================= */}
                {/* Header */}
                {/* ================================= */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                        <h1 className="text-2xl font-bold text-gray-800">
                            Assignment Details
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            View assignment and submit your answer
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
                {/* Assignment Information */}
                {/* ================================= */}

                <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="break-words text-xl font-bold text-gray-800 sm:text-2xl">

                        {assignment.title}

                    </h2>


                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 sm:text-base">

                        {
                            assignment.description
                        }

                    </p>


                    <div className="mt-6 grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 text-sm text-gray-700 sm:text-base md:grid-cols-2">


                        <p className="break-words">

                            <strong>
                                Class / Course:
                            </strong>{" "}

                            {assignment.classRoomName ||
                                "-"}

                        </p>


                        <p className="break-words">

                            <strong>
                                Subject:
                            </strong>{" "}

                            {assignment.subjectName ||
                                "-"}

                        </p>


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
                                Submission Update:
                            </strong>{" "}


                            <span
                                className={
                                    assignment.allowSubmissionUpdate
                                        ? "font-medium text-green-600"
                                        : "font-medium text-red-600"
                                }
                            >
                                {assignment.allowSubmissionUpdate
                                    ? "Allowed"
                                    : "Not Allowed"}
                            </span>

                        </p>

                    </div>


                    {deadlinePassed && (

                        <div className="mt-4 break-words rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">

                            The submission deadline has passed.

                        </div>

                    )}

                </div>


                {/* ================================= */}
                {/* Existing Submission */}
                {/* ================================= */}

                {submission && (

                    <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">

                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            My Submission
                        </h2>


                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:text-base md:grid-cols-2">


                            {/* Status */}
                            <p>

                                <strong>
                                    Status:
                                </strong>{" "}


                                <span
                                    className={
                                        submission.status ===
                                        "Reviewed"
                                            ? "font-semibold text-green-600"
                                            : submission.status ===
                                                "NeedsRevision"
                                              ? "font-semibold text-orange-600"
                                              : "font-semibold text-blue-600"
                                    }
                                >
                                    {
                                        submission.status
                                    }
                                </span>

                            </p>


                            {/* Submitted */}
                            <p className="break-words">

                                <strong>
                                    Submitted At:
                                </strong>{" "}

                                {new Date(
                                    submission.submittedAt
                                ).toLocaleString()}

                            </p>


                            {/* Updated */}
                            {submission.updatedAt && (

                                <p className="break-words">

                                    <strong>
                                        Last Updated:
                                    </strong>{" "}

                                    {new Date(
                                        submission.updatedAt
                                    ).toLocaleString()}

                                </p>

                            )}


                            {/* Marks */}
                            {submission.marks !==
                                null && (

                                <p>

                                    <strong>
                                        Marks:
                                    </strong>{" "}


                                    <span className="font-semibold text-green-700">

                                        {
                                            submission.marks
                                        }{" "}
                                        /{" "}
                                        {
                                            submission.maximumMarks
                                        }

                                    </span>

                                </p>

                            )}

                        </div>


                        {/* Teacher Feedback */}
                        {submission.feedback && (

                            <div className="mt-5 rounded-md bg-blue-50 p-4">

                                <strong className="text-gray-800">
                                    Teacher Feedback:
                                </strong>


                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 sm:text-base">

                                    {
                                        submission.feedback
                                    }

                                </p>

                            </div>

                        )}

                    </div>

                )}


                {/* ================================= */}
                {/* Answer Form */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                    <h2 className="mb-5 text-xl font-bold text-gray-800">

                        {submission
                            ? "Update Submission"
                            : "Submit Assignment"}

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


                    {/* Update Not Allowed */}
                    {submission &&
                    !assignment.allowSubmissionUpdate ? (

                        <div className="break-words rounded bg-yellow-100 p-4 text-sm text-yellow-800 sm:text-base">

                            Updating this submission is not allowed by the teacher.

                        </div>

                    ) : deadlinePassed ? (

                        <div className="break-words rounded bg-red-100 p-4 text-sm text-red-700 sm:text-base">

                            The deadline has passed. Submission changes are no longer allowed.

                        </div>

                    ) : (

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5"
                        >


                            {/* Answer */}
                            <div>

                                <label
                                    htmlFor="answer"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Answer{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="answer"
                                    value={
                                        answer
                                    }
                                    rows={10}
                                    required
                                    onChange={(e) =>
                                        setAnswer(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write your assignment answer here..."
                                    className="w-full min-w-0 resize-y rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 sm:text-base"
                                />

                            </div>


                            {/* Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row">

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        (submission !==
                                            null &&
                                            !canUpdate)
                                    }
                                    className="w-full rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                                >

                                    {submitting
                                        ? "Saving..."
                                        : submission
                                          ? "Update Submission"
                                          : "Submit Assignment"}

                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        submitting
                                    }
                                    onClick={() =>
                                        router.push(
                                            "/dashboard"
                                        )
                                    }
                                    className="w-full rounded-md bg-gray-500 px-6 py-2.5 text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </main>

        </div>
    );
}
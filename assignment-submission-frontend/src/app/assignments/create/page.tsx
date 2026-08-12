"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import { useRouter } from "next/navigation";
import axios from "axios";

import Navbar from "@/components/Navbar";

import {
    createAssignment,
} from "@/services/assignmentService";

import {
    getMyTeacherClassSubjects,
    type MyTeacherClassSubject,
} from "@/services/teacherClassSubjectService";

import { getToken } from "@/utils/token";


interface LoggedInUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}


export default function CreateAssignmentPage() {
    const router = useRouter();


    // ========================================
    // Teacher Assigned Class + Subject
    // ========================================
    const [
        teacherAssignments,
        setTeacherAssignments,
    ] = useState<MyTeacherClassSubject[]>([]);

    const [
        selectedAssignmentId,
        setSelectedAssignmentId,
    ] = useState<string>("");


    // ========================================
    // Form Fields
    // ========================================
    const [title, setTitle] =
        useState<string>("");

    const [description, setDescription] =
        useState<string>("");

    const [deadline, setDeadline] =
        useState<string>("");

    const [
        maximumMarks,
        setMaximumMarks,
    ] = useState<string>("100");

    const [
        isPublished,
        setIsPublished,
    ] = useState<boolean>(false);

    const [
        allowSubmissionUpdate,
        setAllowSubmissionUpdate,
    ] = useState<boolean>(true);


    // ========================================
    // UI State
    // ========================================
    const [loading, setLoading] =
        useState<boolean>(true);

    const [submitting, setSubmitting] =
        useState<boolean>(false);

    const [error, setError] =
        useState<string>("");

    const [success, setSuccess] =
        useState<string>("");


    // ========================================
    // Initial Load
    // ========================================
    useEffect(() => {
        const initializePage = async () => {
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
                const user: LoggedInUser =
                    JSON.parse(storedUser);


                // Teacher only
                if (user.role !== "Teacher") {
                    router.push("/dashboard");
                    return;
                }


                const data =
                    await getMyTeacherClassSubjects();


                setTeacherAssignments(data);

            } catch (err) {
                console.error(
                    "Teacher Assignment Load Error:",
                    err
                );


                setError(
                    "Failed to load your assigned classes and subjects."
                );

            } finally {
                setLoading(false);
            }
        };


        initializePage();

    }, [router]);


    // ========================================
    // Create Assignment
    // ========================================
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();


        setError("");
        setSuccess("");


        const trimmedTitle =
            title.trim();

        const trimmedDescription =
            description.trim();


        // ====================================
        // Frontend Validation
        // ====================================
        if (!trimmedTitle) {
            setError(
                "Assignment title is required."
            );

            return;
        }


        if (trimmedTitle.length > 200) {
            setError(
                "Assignment title cannot exceed 200 characters."
            );

            return;
        }


        if (!trimmedDescription) {
            setError(
                "Assignment description is required."
            );

            return;
        }


        if (!selectedAssignmentId) {
            setError(
                "Please select a Class/Course and Subject."
            );

            return;
        }


        if (!deadline) {
            setError(
                "Deadline is required."
            );

            return;
        }


        const deadlineDate =
            new Date(deadline);


        if (
            Number.isNaN(
                deadlineDate.getTime()
            )
        ) {
            setError(
                "Please enter a valid deadline."
            );

            return;
        }


        if (
            deadlineDate.getTime() <=
            Date.now()
        ) {
            setError(
                "Deadline must be in the future."
            );

            return;
        }


        const marks =
            Number(maximumMarks);


        if (
            !Number.isInteger(marks) ||
            marks < 1 ||
            marks > 1000
        ) {
            setError(
                "Maximum marks must be between 1 and 1000."
            );

            return;
        }


        const selectedMapping =
            teacherAssignments.find(
                (item) =>
                    item.id ===
                    Number(
                        selectedAssignmentId
                    )
            );


        if (!selectedMapping) {
            setError(
                "Selected Class/Course and Subject is invalid."
            );

            return;
        }


        // ====================================
        // Submit
        // ====================================
        try {
            setSubmitting(true);


            await createAssignment({
                title:
                    trimmedTitle,

                description:
                    trimmedDescription,

                classRoomId:
                    selectedMapping.classRoomId,

                subjectId:
                    selectedMapping.subjectId,

                deadline:
                    deadlineDate.toISOString(),

                maximumMarks:
                    marks,

                isPublished,

                allowSubmissionUpdate,
            });


            setSuccess(
                "Assignment created successfully."
            );


            setTimeout(() => {
                router.push(
                    "/dashboard"
                );
            }, 800);

        } catch (err: unknown) {
            console.error(
                "Create Assignment Error:",
                err
            );


            if (
                axios.isAxiosError(err)
            ) {
                const message =
                    err.response?.data?.message;


                setError(
                    message ||
                        "Failed to create assignment."
                );

            } else {
                setError(
                    "Failed to create assignment."
                );
            }

        } finally {
            setSubmitting(false);
        }
    };


    // ========================================
    // Loading
    // ========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />


                <main className="mx-auto max-w-4xl p-4 sm:p-6">

                    <div className="rounded-lg bg-white p-4 shadow sm:p-6">

                        <p className="text-gray-600">
                            Loading assignment form...
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <main className="mx-auto max-w-4xl p-4 sm:p-6">


                {/* ================================= */}
                {/* Header */}
                {/* ================================= */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                        <h1 className="text-2xl font-bold text-gray-800">
                            Create Assignment
                        </h1>


                        <p className="mt-1 text-sm text-gray-500">
                            Create an assignment for your
                            assigned class and subject
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
                {/* Form */}
                {/* ================================= */}

                <div className="rounded-lg bg-white p-4 shadow sm:p-6">


                    {/* Error */}
                    {error && (
                        <div className="mb-5 break-words rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">
                            {error}
                        </div>
                    )}


                    {/* Success */}
                    {success && (
                        <div className="mb-5 break-words rounded bg-green-100 p-3 text-sm text-green-700 sm:text-base">
                            {success}
                        </div>
                    )}


                    {/* ================================= */}
                    {/* No Teacher Mapping */}
                    {/* ================================= */}

                    {teacherAssignments.length ===
                    0 ? (

                        <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 sm:p-5">

                            <h2 className="font-semibold">
                                No Class/Subject Assignment Found
                            </h2>


                            <p className="mt-2 text-sm leading-6">
                                You have not been assigned to any
                                Class/Course and Subject yet.
                                Please contact the Admin.
                            </p>

                        </div>

                    ) : (

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-6"
                        >


                            {/* ================================= */}
                            {/* Title */}
                            {/* ================================= */}

                            <div>

                                <label
                                    htmlFor="title"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Title{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>


                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    maxLength={200}
                                    required
                                    onChange={(e) =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: Mathematics Assignment 1"
                                    className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                />


                                <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500">

                                    <span>
                                        Maximum 200 characters
                                    </span>

                                    <span>
                                        {title.length}/200
                                    </span>

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
                                    Description{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="description"
                                    value={
                                        description
                                    }
                                    rows={5}
                                    required
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter assignment instructions..."
                                    className="w-full min-w-0 resize-y rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                />

                            </div>


                            {/* ================================= */}
                            {/* Class + Subject */}
                            {/* ================================= */}

                            <div>

                                <label
                                    htmlFor="classSubject"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Class / Course & Subject{" "}

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>


                                <select
                                    id="classSubject"
                                    value={
                                        selectedAssignmentId
                                    }
                                    required
                                    onChange={(e) =>
                                        setSelectedAssignmentId(
                                            e.target.value
                                        )
                                    }
                                    className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Class / Course & Subject
                                    </option>


                                    {teacherAssignments.map(
                                        (item) => (

                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.classRoomName
                                                }
                                                {" — "}
                                                {
                                                    item.subjectName
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* ================================= */}
                            {/* Deadline + Maximum Marks */}
                            {/* ================================= */}

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                                {/* Deadline */}
                                <div className="min-w-0">

                                    <label
                                        htmlFor="deadline"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Deadline{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        id="deadline"
                                        type="datetime-local"
                                        value={
                                            deadline
                                        }
                                        required
                                        onChange={(e) =>
                                            setDeadline(
                                                e.target.value
                                            )
                                        }
                                        className="w-full min-w-0 max-w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-800 outline-none focus:border-blue-500 sm:px-4"
                                    />

                                </div>


                                {/* Maximum Marks */}
                                <div className="min-w-0">

                                    <label
                                        htmlFor="maximumMarks"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Maximum Marks{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        id="maximumMarks"
                                        type="number"
                                        value={
                                            maximumMarks
                                        }
                                        min={1}
                                        max={1000}
                                        required
                                        onChange={(e) =>
                                            setMaximumMarks(
                                                e.target.value
                                            )
                                        }
                                        className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500"
                                    />


                                    <p className="mt-1 text-xs text-gray-500">
                                        Allowed range: 1 - 1000
                                    </p>

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* Publish */}
                            {/* ================================= */}

                            <div className="rounded-md border border-gray-200 p-4">

                                <div className="flex items-start gap-3">

                                    <input
                                        id="isPublished"
                                        type="checkbox"
                                        checked={
                                            isPublished
                                        }
                                        onChange={(e) =>
                                            setIsPublished(
                                                e.target.checked
                                            )
                                        }
                                        className="mt-1 h-4 w-4 shrink-0"
                                    />


                                    <label
                                        htmlFor="isPublished"
                                        className="font-medium text-gray-700"
                                    >
                                        Publish Assignment
                                    </label>

                                </div>


                                <p className="ml-7 mt-1 text-sm leading-6 text-gray-500">
                                    If unchecked, the assignment
                                    will be saved as Draft.
                                </p>

                            </div>


                            {/* ================================= */}
                            {/* Submission Update */}
                            {/* ================================= */}

                            <div className="rounded-md border border-gray-200 p-4">

                                <div className="flex items-start gap-3">

                                    <input
                                        id="allowSubmissionUpdate"
                                        type="checkbox"
                                        checked={
                                            allowSubmissionUpdate
                                        }
                                        onChange={(e) =>
                                            setAllowSubmissionUpdate(
                                                e.target.checked
                                            )
                                        }
                                        className="mt-1 h-4 w-4 shrink-0"
                                    />


                                    <label
                                        htmlFor="allowSubmissionUpdate"
                                        className="font-medium text-gray-700"
                                    >
                                        Allow Submission Update
                                    </label>

                                </div>


                                <p className="ml-7 mt-1 text-sm leading-6 text-gray-500">
                                    Students can update their
                                    submission before the deadline.
                                </p>

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
                                    className="w-full rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                                >

                                    {submitting
                                        ? "Creating..."
                                        : isPublished
                                          ? "Create & Publish"
                                          : "Save as Draft"}

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
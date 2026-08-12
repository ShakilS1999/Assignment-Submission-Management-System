"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    getUser,
    logout,
} from "@/utils/auth";


interface LoggedInUser {
    id?: number;
    fullName?: string;
    email?: string;
    role: string;
}


export default function Navbar() {
    const router = useRouter();

    const [user, setUser] =
        useState<LoggedInUser | null>(null);


    // ========================================
    // Load Logged In User
    // ========================================
    useEffect(() => {
        const currentUser =
            getUser() as LoggedInUser | null;

        setUser(currentUser);
    }, []);


    // ========================================
    // Logout
    // ========================================
    const handleLogout = () => {
        logout();

        router.push("/login");
    };


    return (
        <nav className="bg-blue-800 text-white shadow">

            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">


                {/* ================================= */}
                {/* Project Title */}
                {/* ================================= */}

                <div className="min-w-0">

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="text-left text-sm font-semibold leading-5 text-white sm:text-base"
                    >
                        Assignment Submission Management
                    </button>

                </div>


                {/* ================================= */}
                {/* User / Logout */}
                {/* ================================= */}

                <div className="flex items-center justify-between gap-3 sm:justify-end">


                    {user && (

                        <span className="rounded bg-blue-700 px-3 py-1 text-sm font-medium">
                            {user.role}
                        </span>

                    )}


                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}
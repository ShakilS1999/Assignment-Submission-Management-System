"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/services/authService";
import { setToken } from "@/utils/token";


export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");


    // ========================================
    // Login
    // ========================================
    const handleLogin = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        try {
            const response =
                await login({
                    email,
                    password,
                });

            setToken(
                response.token
            );

            router.push(
                "/dashboard"
            );

        } catch (error) {
            console.error(
                "Login Error:",
                error
            );

            setError(
                "Invalid email or password"
            );
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">

            <form
                onSubmit={handleLogin}
                className="w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8"
            >

                {/* Title */}
                <div className="mb-6 text-center">

                    <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Login
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Assignment Submission Management System
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-4 break-words rounded-md bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}


                {/* Email */}
                <div className="mb-4">

                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        required
                        autoComplete="email"
                        placeholder="Enter your email"
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none transition focus:border-blue-500"
                    />

                </div>


                {/* Password */}
                <div className="mb-5">

                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 outline-none transition focus:border-blue-500"
                    />

                </div>


                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
                >
                    Login
                </button>

            </form>

        </div>
    );
}
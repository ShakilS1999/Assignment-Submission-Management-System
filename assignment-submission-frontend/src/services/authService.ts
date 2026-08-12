import api from "@/config/api";
import { setToken } from "@/utils/token";
import { setUser } from "@/utils/auth";


export interface LoginRequest {
    email: string;
    password: string;
}



export interface LoginResponse {

    token: string;

    user: {

        id: number;
        fullName: string;
        email: string;
        role: string;

    };

}



export const login = async (
    data: LoginRequest
): Promise<LoginResponse> => {


    try {


        const response =
            await api.post<LoginResponse>(
                "/Auth/login",
                data
            );



        console.log(
            "LOGIN RESPONSE:",
            response.data
        );



        // Save JWT Token

        setToken(
            response.data.token
        );



        // Save User Information

        setUser(
            response.data.user
        );



        return response.data;



    } catch (error: any) {


        console.log(
            "LOGIN ERROR:",
            error.response?.data ||
            error.message
        );


        throw error;

    }

};
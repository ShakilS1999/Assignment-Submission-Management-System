import { getToken } from "./token";


const USER_KEY = "user";


export const isAuthenticated = () => {

    const token = getToken();

    return !!token;

};



export const setUser = (user: any) => {

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );

};



export const getUser = () => {

    const user =
        localStorage.getItem(USER_KEY);


    if (!user) {

        return null;

    }


    return JSON.parse(user);

};



export const removeUser = () => {

    localStorage.removeItem(USER_KEY);

};


export const logout = () => {

    localStorage.removeItem(
        "access_token"
    );


    localStorage.removeItem(
        "user"
    );

};
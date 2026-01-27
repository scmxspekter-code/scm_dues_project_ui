import { customFetch } from "@/utils/customFetch"
import { IApiBaseResponse, User } from "@/types";

interface IAuthenticationResponse  {
    accessToken: string;
    accessTokenExpires: number;
    user: User;
}

interface ILoginPayload{
    email: string;
    password: string;
}
export default ()=>{
    return {
        login:  (payload:ILoginPayload):Promise<IApiBaseResponse<IAuthenticationResponse>> => {
            return customFetch("/authentication/login", {
                method: "POST",
                data: payload
            });
        },
        me: ():Promise<IApiBaseResponse<User>> => {
            return customFetch("/authentication/me", { method: "GET" });
        },
    }
}
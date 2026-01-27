import { IApiBaseResponse, MessageLog } from "@/types";
import { customFetch } from "@/utils/customFetch";

export default()=>{
    return{
        getMessageHistory(id:string):Promise<IApiBaseResponse<MessageLog[]>>{
            return customFetch(`/messaging/history/${id}`, { method: "GET" });
        }
    }
}
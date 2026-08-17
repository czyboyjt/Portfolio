
import { ChatMessage } from "../types";
 
 export const getUXConsultation = async (messages: ChatMessage[]): Promise<string> => {
   try {
     const res = await fetch("/api/ai/consultation", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ messages }),
     });
 
     if (!res.ok) {
       throw new Error(`Server responded with ${res.status}`);
     }
 
     const data = await res.json();
     return data.reply || "I'm having trouble thinking of a response right now. Let's try again in a moment.";
   } catch (error) {
     console.error("Gemini API Error:", error);
     return "I apologize, but my connection to the UX collective is currently interrupted. Please try again soon.";
   }
 };


import MessagesPage from "@/components/messages/MessagePage";
import { Loader } from "lucide-react";
import { Suspense } from "react";

export default function Message() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MessagesPage />
    </Suspense>
  );
}

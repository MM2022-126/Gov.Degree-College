import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "@/lib/api";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyAuth();
      setAuthState(isValid ? "valid" : "invalid");
    };

    checkAuth();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authState === "invalid") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

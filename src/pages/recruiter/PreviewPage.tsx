import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function PreviewPage() {
  const { company } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (company) {
      // Redirect to the actual public careers page in a new tab
      window.open(`/${company.slug}/careers`, "_blank");
      // Navigate back to dashboard
      navigate("/dashboard");
    }
  }, [company, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Opening preview...</h2>
        <p className="text-gray-600">
          Your careers page will open in a new tab
        </p>
      </div>
    </div>
  );
}

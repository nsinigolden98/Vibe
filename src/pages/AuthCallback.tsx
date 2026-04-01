import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }

      if (data.session) {
        navigate("/Stream");
      } else {
        navigate("/auth");
      }
    };

    handleAuth();
  }, [navigate]);

  return <p>Loading...</p>;
}
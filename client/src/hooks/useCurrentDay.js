import { useCallback, useEffect, useState } from "react";
import { getCurrentDay } from "../services/daysApi";

export function useCurrentDay() {
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setErrorCode("");

      const response = await getCurrentDay();

      setDay(response.data);
    } catch (error) {
      setDay(null);
      setError(error.message);
      setErrorCode(error.code || "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    day,
    loading,
    error,
    errorCode,
    refresh,
  };
}

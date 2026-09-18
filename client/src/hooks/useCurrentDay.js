import { useCallback, useEffect, useState } from "react";
import { getCurrentDay } from "../services/daysApi";

export function useCurrentDay() {
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setErrorCode("");

        const response = await getCurrentDay();

        if (!cancelled) {
          setDay(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setDay(null);
          setError(error.message);
          setErrorCode(error.code || "");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

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

  return {
    day,
    loading,
    error,
    errorCode,
    refresh,
  };
}

import { useState, useCallback } from "react";
import api from "../api";

const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callApi = useCallback(
    async (method, endpoint, payload = null, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        switch (method.toLowerCase()) {
          case "get":
            response = await api.get(endpoint, options);
            break;
          case "post":
            response = await api.post(endpoint, payload, options);
            break;
          case "put":
            response = await api.put(endpoint, payload, options);
            break;
          case "delete":
            response = await api.delete(endpoint, options);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setData(response.data);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "API call failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    callApi,
  };
};

export default useApiCall;

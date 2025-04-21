import { useState } from "react";
import api from "../api";

const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadDocument = async (file, documentType, employeeId) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", documentType);

      if (employeeId) {
        formData.append("employeeId", employeeId);
      }

      const response = await api.post("/employee/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      return response.data.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to upload document";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const uploadVisaDocument = async (file, documentType) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);

      const response = await api.post("/visa-status/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      return response.data.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to upload visa document";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    uploadVisaDocument,
    uploading,
    progress,
    error,
  };
};

export default useDocumentUpload;

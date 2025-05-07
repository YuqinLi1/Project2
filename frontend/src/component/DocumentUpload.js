import React, { useState } from "react";
import { Button, Form } from "semantic-ui-react";
import axios from "axios";

const DocumentUpload = ({
  employeeId,
  documentTitle,
  documentType,
  mode,
  isVisa = false,
  onFileChange,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file?.name || "");
  
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const getEndpoint = (action) => {
    const base = isVisa ? "visa-status" : "documents";
    return `http://localhost:5000/api/${base}/${action}?employeeId=${employeeId}&type=${encodeURIComponent(documentType)}`;
  };

  const handlePreview = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = getEndpoint("preview");
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = getEndpoint("download");
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || documentTitle;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <Form.Field>
      <label>{documentTitle}</label>

      {(mode === "never submit" || mode === "rejected") && (
        <>
          <input
            type="file"
            id={`file-${documentType}`}
            onChange={handleFileChange}
          />
        </>
      )}

      {mode !== "never submit" && mode !== "rejected" && (
        <>
          <Button type="button" onClick={handlePreview}>
            Preview
          </Button>
          <Button type="button" onClick={handleDownload}>
            Download
          </Button>
        </>
      )}
    </Form.Field>
  );
};

export default DocumentUpload;
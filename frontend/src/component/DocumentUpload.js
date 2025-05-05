import React, { useState } from "react";
import { Button, Form } from "semantic-ui-react";

const DocumentUpload = ({
  employeeId,
  documentTitle,
  documentType,
  mode,
  documentId,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file?.name || "");
  };

  // Modified to force append the token to URL
  const handlePreview = () => {
    const token = localStorage.getItem("token");

    let url;
    if (documentId) {
      // For document ID-based preview
      url = `http://localhost:5000/api/documents/${documentId}/preview?token=${encodeURIComponent(
        token
      )}`;
      console.log("Opening preview with ID:", documentId);
    } else {
      // For query parameter-based preview - this might not work depending on your backend
      console.log("Warning: No document ID available for preview");
      return;
    }

    window.open(url, "_blank");
  };

  const handleDownload = () => {
    const token = localStorage.getItem("token");

    let url;
    if (documentId) {
      url = `http://localhost:5000/api/documents/${documentId}/download?token=${encodeURIComponent(
        token
      )}`;
    } else {
      url = `http://localhost:5000/api/documents/download?employeeId=${employeeId}&type=${documentType}&token=${encodeURIComponent(
        token
      )}`;
    }

    console.log("Opening download URL:", url);
    window.open(url, "_blank");
  };

  // Show file upload for new submissions or rejected applications
  const showUploadInput = mode === "never submit" || mode === "rejected";

  // Show preview buttons for pending or approved applications
  const showPreviewButtons = mode === "pending" || mode === "approved";

  return (
    <Form.Field>
      <label>{documentTitle}</label>

      {showUploadInput && (
        <>
          <input
            type="file"
            id={`file-${documentType}`}
            onChange={handleFileChange}
          />
          {fileName && <p>Selected file: {fileName}</p>}
        </>
      )}

      {/* Always show buttons in pending mode, regardless of documentId */}
      {showPreviewButtons && (
        <div>
          <Button type="button" onClick={handlePreview}>
            Preview
          </Button>
          <Button type="button" onClick={handleDownload}>
            Download
          </Button>
        </div>
      )}
    </Form.Field>
  );
};

export default DocumentUpload;

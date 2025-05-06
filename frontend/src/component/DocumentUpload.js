import React, { useState } from "react";
import { Button, Form } from "semantic-ui-react";

const DocumentUpload = ({
  employeeId,
  documentTitle,
  documentType,
  mode,
  isVisa = false,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file?.name || "");
  };

  const getEndpoint = (action) => {
    const base = isVisa ? "visa-status" : "documents";
    return `http://localhost:5000/api/${base}/${action}?employeeId=${employeeId}&type=${encodeURIComponent(
      documentType
    )}`;
  };

  const handlePreview = () => {
    window.open(getEndpoint("preview"), "_blank");
  };

  const handleDownload = () => {
    window.open(getEndpoint("download"), "_blank");
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, List, Message } from 'semantic-ui-react';

const DocumentUpload = ({ employeeId }) => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/document/employee/${employeeId}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      setError("Failed to fetch documents");
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !employeeId) {
      setError("No file or employee ID");
      return;
    }

    const formData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("documents", file);

    try {
      await axios.post("http://localhost:5000/api/document/upload-multiple", formData);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setError("Upload failed");
    }
  };

  const handlePreview = (docId) => {
    window.open(`http://localhost:5000/api/document/preview/${docId}`, "_blank");
  };

  const handleDownload = (docId) => {
    window.open(`http://localhost:5000/api/document/download/${docId}`, "_blank");
  };

  return (
    <div>
      <h3>Document Upload</h3>
      {error && <Message negative>{error}</Message>}
      <Input type="file" onChange={handleFileChange} />
      <Button primary onClick={handleUpload}>Upload</Button>
      <List divided relaxed>
        {documents.map((doc) => (
          <List.Item key={doc._id}>
            <List.Content>
              <List.Header>{doc.filename}</List.Header>
              <Button size="small" onClick={() => handlePreview(doc._id)}>Preview</Button>
              <Button size="small" onClick={() => handleDownload(doc._id)}>Download</Button>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default DocumentUpload;
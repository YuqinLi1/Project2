const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");

const getDocumentByEmployeeAndType = async (employeeId, type) => {
  return await Document.findOne({ employeeId, type });
};

const saveUploadedDocument = async ({ employeeId, file, type }) => {
  console.log("check 12 ", employeeId);
  if (!file) throw new Error("Missing file");

  const newDoc = new Document({
    employeeId,
    type,
    fileName: file.originalname,
    fileUrl: `uploads/${file.filename}`, // or file.path if you use multer disk storage
    fileSize: file.size,
    mimeType: file.mimetype,
  });

  return await newDoc.save();
};

const streamPreviewDocument = async (employeeId, type, res) => {
  const document = await getDocumentByEmployeeAndType(employeeId, type);
  if (!document) throw new Error("Document not found");

  res.set("Content-Type", document.mimeType || "application/octet-stream");
  fs.createReadStream(path.resolve(document.fileUrl)).pipe(res);
};

const streamDownloadDocument = async (employeeId, type, res) => {
  const document = await getDocumentByEmployeeAndType(employeeId, type);
  if (!document) throw new Error("Document not found");

  res.download(path.resolve(document.fileUrl), document.fileName);
};

const getDocumentsByEmployeeId = async (employeeId) => {
  return await Document.find({ employeeId });
};

module.exports = {
  saveUploadedDocument,
  getDocumentByEmployeeAndType,
  streamPreviewDocument,
  streamDownloadDocument,
  getDocumentsByEmployeeId,
};

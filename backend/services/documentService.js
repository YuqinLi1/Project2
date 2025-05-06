const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");

const getDocumentByEmployeeAndType = async (employeeId, type) => {
  return await Document.findOne({ employeeId, type });
};

const Profile_Types = [
  "Profile Picture",
  "Driver's License",
  "Work Authorization",
  "OPT Receipt",
];

const getDocumentsByEmployeeId = async (employeeId) => {
  return await Document.find({
    employeeId,
    type: { $in: Profile_Types },
  });
};

const saveUploadedDocument = async ({ employeeId, file, type }) => {
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

  const filePath = path.resolve(document.fileUrl);
  const fileStream = fs.createReadStream(filePath);

  res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);

  fileStream.pipe(res);
};

const streamDownloadDocument = async (employeeId, type, res) => {
  const document = await getDocumentByEmployeeAndType(employeeId, type);
  if (!document) throw new Error("Document not found");

  res.download(path.resolve(document.fileUrl), document.fileName);
};

module.exports = {
  getDocumentsByEmployeeId,
  saveUploadedDocument,
  getDocumentByEmployeeAndType,
  streamPreviewDocument,
  streamDownloadDocument,
};

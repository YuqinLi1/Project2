export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

export const isImageFile = (filename) => {
  const ext = getFileExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(ext);
};

export const isPdfFile = (filename) => {
  const ext = getFileExtension(filename);
  return ext === "pdf";
};

export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const base64toBlob = (base64, mimeType) => {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeType });
};

export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);

  if (isImageFile(filename)) return "file-image";
  if (isPdfFile(filename)) return "file-pdf";

  switch (ext) {
    case "doc":
    case "docx":
      return "file-word";
    case "xls":
    case "xlsx":
      return "file-excel";
    case "ppt":
    case "pptx":
      return "file-powerpoint";
    case "zip":
    case "rar":
    case "7z":
      return "file-zip";
    case "txt":
      return "file-text";
    default:
      return "file";
  }
};

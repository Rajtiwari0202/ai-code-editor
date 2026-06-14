import { TemplateFile, TemplateFolder } from "./path-to-json";

export function findFilePath(
  file: TemplateFile,
  folder: TemplateFolder,
  pathSoFar: string[] = []
): string | null {
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
      if (res) return res;
    } else {
      if (
        item.filename === file.filename &&
        item.fileExtension === file.fileExtension
      ) {
        return [
          ...pathSoFar,
          item.filename + (item.fileExtension ? "." + item.fileExtension : ""),
        ].join("/");
      }
    }
  }
  return null;
}



export const generateFileId = (file: TemplateFile, rootFolder: TemplateFolder): string => {
  const path = findFilePath(file, rootFolder)?.replace(/^\/+/, '') || '';

  if (path) {
    return path;
  }

  return file.fileExtension
    ? `${file.filename}.${file.fileExtension}`
    : file.filename;
}

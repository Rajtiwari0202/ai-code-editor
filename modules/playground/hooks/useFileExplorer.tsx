import { create } from "zustand";
import { toast } from "sonner";
import type { WebContainer } from "@webcontainer/api";

import type { TemplateFile, TemplateFolder } from "../lib/path-to-json";

import { generateFileId, getTemplateFileName, joinTemplatePath } from "../lib";

type WebContainerInstance = WebContainer | null;

function getTemplateItemName(item: TemplateFile | TemplateFolder) {
  return "folderName" in item ? item.folderName : getTemplateFileName(item);
}

function findFolderByPath(root: TemplateFolder, parentPath: string) {
  const pathParts = parentPath.split("/").filter(Boolean);
  let currentFolder = root;

  for (const part of pathParts) {
    const nextFolder = currentFolder.items.find(
      (item) => "folderName" in item && item.folderName === part
    );

    if (!nextFolder || !("folderName" in nextFolder)) {
      return null;
    }

    currentFolder = nextFolder;
  }

  return currentFolder;
}

function hasNameCollision(
  folder: TemplateFolder,
  itemName: string,
  ignoredIndex?: number
) {
  return folder.items.some(
    (item, index) =>
      index !== ignoredIndex && getTemplateItemName(item) === itemName
  );
}

interface OpenFile extends TemplateFile {
  id: string;
  path: string;
  hasUnsavedChanges: boolean;
  content: string;
  originalContent: string;
}

interface FileExplorerState {
  playgroundId: string;
  templateData: TemplateFolder | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  editorContent: string;

  setPlaygroundId: (id: string) => void;
  setTemplateData: (data: TemplateFolder | null) => void;
  setEditorContent: (content: string) => void;
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFileId: (fileId: string | null) => void;

  openFile: (file: TemplateFile, filePath?: string) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;

  // File explorer methods
   handleAddFile: (
    newFile: TemplateFile,
    parentPath: string,
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleAddFolder: (
    newFolder: TemplateFolder, 
    parentPath: string,
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleDeleteFile: (
    file: TemplateFile, 
    parentPath: string, 
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
    instance: WebContainerInstance,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  
  updateFileContent: (fileId: string, content: string) => void;
}

export const useFileExplorer = create<FileExplorerState>()((set, get) => ({
  templateData: null,
  playgroundId: "",
  openFiles: [] satisfies OpenFile[],
  activeFileId: null,
  editorContent: "",

  setTemplateData: (data) => set({ templateData: data }),
  setPlaygroundId(id) {
    set({ playgroundId: id });
  },
  setEditorContent: (content) => set({ editorContent: content }),
  setOpenFiles: (files) => set({ openFiles: files }),
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),

  openFile: (file, filePath) => {
    const resolvedPath =
      filePath?.replace(/^\/+/, "") || generateFileId(file, get().templateData!);
    const fileId = resolvedPath;
    const { openFiles } = get();
    const existingFile = openFiles.find((f) => f.id === fileId);

    if (existingFile) {
      set({ activeFileId: fileId, editorContent: existingFile.content });
      return;
    }

    const newOpenFile: OpenFile = {
      ...file,
      id: fileId,
      path: resolvedPath,
      hasUnsavedChanges: false,
      content: file.content || "",
      originalContent: file.content || "",
    };

    set((state) => ({
      openFiles: [...state.openFiles, newOpenFile],
      activeFileId: fileId,
      editorContent: file.content || "",
    }));
  },

  closeFile:(fileId)=>{
    const {openFiles , activeFileId} = get();
     const newFiles = openFiles.filter((f) => f.id !== fileId);

      // If we're closing the active file, switch to another file or clear active
    let newActiveFileId = activeFileId;
    let newEditorContent = get().editorContent;

    if(activeFileId === fileId){
        if(newFiles.length > 0){
              const lastFile = newFiles[newFiles.length - 1];
        newActiveFileId = lastFile.id;
        newEditorContent = lastFile.content;
        }
        else{
            newActiveFileId = null;
            newEditorContent = "";
        }
    }

    set({
        openFiles:newFiles,
        activeFileId:newActiveFileId,
        editorContent:newEditorContent
    })
    
  },
    closeAllFiles: () => {
    set({
      openFiles: [],
      activeFileId: null,
      editorContent: "",
    });
  },

  handleAddFile:async(newFile , parentPath , writeFileSync , _instance , saveTemplateData)=>{
        const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      const fileName = getTemplateFileName(newFile);
      if (hasNameCollision(currentFolder, fileName)) {
        toast.error(`"${fileName}" already exists in this folder`);
        return;
      }

      currentFolder.items.push(newFile);
      set({ templateData: updatedTemplateData });
      toast.success(`Created file: ${fileName}`);

      await saveTemplateData(updatedTemplateData);

      // Sync with web container
      if (writeFileSync) {
        const filePath = joinTemplatePath(parentPath, fileName);
        await writeFileSync(filePath, newFile.content || "");
      }

      get().openFile(newFile, joinTemplatePath(parentPath, fileName));
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to create file");
    }
  },

    handleAddFolder: async (newFolder, parentPath, instance, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      if (hasNameCollision(currentFolder, newFolder.folderName)) {
        toast.error(`"${newFolder.folderName}" already exists in this folder`);
        return;
      }

      currentFolder.items.push(newFolder);
      set({ templateData: updatedTemplateData });
      toast.success(`Created folder: ${newFolder.folderName}`);

      await saveTemplateData(updatedTemplateData);

      // Sync with web container
      if (instance && instance.fs) {
        const folderPath = parentPath
          ? `${parentPath}/${newFolder.folderName}`
          : newFolder.folderName;
        await instance.fs.mkdir(folderPath, { recursive: true });
      }
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  },

    handleDeleteFile: async (file, parentPath, instance, saveTemplateData) => {
    const { templateData, openFiles } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("filename" in item) ||
          item.filename !== file.filename ||
          item.fileExtension !== file.fileExtension
      );

      const fileId = joinTemplatePath(parentPath, getTemplateFileName(file));
      const openFile = openFiles.find((f) => f.id === fileId);
      
      if (openFile) {
        // Close the file using the closeFile method
        get().closeFile(fileId);
      }

      if (instance?.fs) {
        await instance.fs.rm(joinTemplatePath(parentPath, getTemplateFileName(file)), {
          force: true,
        });
      }

      set({ templateData: updatedTemplateData });

      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  },

    handleDeleteFolder: async (folder, parentPath, instance, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("folderName" in item) || item.folderName !== folder.folderName
      );

      const folderPath = joinTemplatePath(parentPath, folder.folderName);
      const openFilesToClose = get().openFiles.filter((file) =>
        file.id.startsWith(`${folderPath}/`)
      );

      openFilesToClose.forEach((file) => get().closeFile(file.id));

      if (instance?.fs) {
        await instance.fs.rm(joinTemplatePath(parentPath, folder.folderName), {
          force: true,
          recursive: true,
        });
      }

      set({ templateData: updatedTemplateData });

      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted folder: ${folder.folderName}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  },

   handleRenameFile: async (
    file,
    newFilename,
    newExtension,
    parentPath,
    instance,
    saveTemplateData
  ) => {
    const { templateData, openFiles, activeFileId } = get();
    if (!templateData) return;

    const oldFileId = joinTemplatePath(parentPath, getTemplateFileName(file));
    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      const fileIndex = currentFolder.items.findIndex(
        (item) =>
          "filename" in item &&
          item.filename === file.filename &&
          item.fileExtension === file.fileExtension
      );

      if (fileIndex !== -1) {
        const updatedFile = {
          ...currentFolder.items[fileIndex],
          filename: newFilename,
          fileExtension: newExtension,
        } as TemplateFile;
        const newFileName = getTemplateFileName(updatedFile);

        if (hasNameCollision(currentFolder, newFileName, fileIndex)) {
          toast.error(`"${newFileName}" already exists in this folder`);
          return;
        }

        currentFolder.items[fileIndex] = updatedFile;

        if (instance?.fs) {
          await instance.fs.rename(
            joinTemplatePath(parentPath, getTemplateFileName(file)),
            joinTemplatePath(parentPath, getTemplateFileName(updatedFile))
          );
        }

        const newFileId = joinTemplatePath(parentPath, getTemplateFileName(updatedFile));

        // Update open files with new ID and names
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === oldFileId
            ? {
                ...f,
                id: newFileId,
                path: newFileId,
                filename: newFilename,
                fileExtension: newExtension,
              }
            : f
        );

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          activeFileId: activeFileId === oldFileId ? newFileId : activeFileId,
        });

        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  },

  
  handleRenameFolder: async (folder, newFolderName, parentPath, instance, saveTemplateData) => {
    const { templateData, openFiles, activeFileId } = get();
    if (!templateData) return;

    try {
      const oldFolderPath = joinTemplatePath(parentPath, folder.folderName);
      const newFolderPath = joinTemplatePath(parentPath, newFolderName);
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const currentFolder = findFolderByPath(updatedTemplateData, parentPath);
      if (!currentFolder) {
        toast.error("Parent folder not found");
        return;
      }

      const folderIndex = currentFolder.items.findIndex(
        (item) => "folderName" in item && item.folderName === folder.folderName
      );

      if (folderIndex !== -1) {
        if (hasNameCollision(currentFolder, newFolderName, folderIndex)) {
          toast.error(`"${newFolderName}" already exists in this folder`);
          return;
        }

        const updatedFolder = {
          ...currentFolder.items[folderIndex],
          folderName: newFolderName,
        } as TemplateFolder;
        currentFolder.items[folderIndex] = updatedFolder;

        if (instance?.fs) {
          await instance.fs.rename(
            oldFolderPath,
            newFolderPath
          );
        }

        const updatedOpenFiles = openFiles.map((file) => {
          if (!file.id.startsWith(`${oldFolderPath}/`)) {
            return file;
          }

          const nextPath = `${newFolderPath}${file.id.slice(oldFolderPath.length)}`;
          return {
            ...file,
            id: nextPath,
            path: nextPath,
          };
        });
        const updatedActiveFileId =
          activeFileId?.startsWith(`${oldFolderPath}/`)
            ? `${newFolderPath}${activeFileId.slice(oldFolderPath.length)}`
            : activeFileId;

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          activeFileId: updatedActiveFileId,
        });

        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed folder to: ${newFolderName}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  },

 updateFileContent: (fileId, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              content,
              hasUnsavedChanges: content !== file.originalContent,
            }
          : file
      ),
      editorContent:
        fileId === state.activeFileId ? content : state.editorContent,
    }));
  },

}));

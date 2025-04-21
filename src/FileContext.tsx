import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SAVED_DIRECTORY_KEY, useDB } from "./db";
import { FileSystem } from "./FileSystem";

enum FileType {
  Directory = "directory",
  File = "file",
}

type FileEntry = {
  type: FileType;
  name: string;
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
};

type FileContextType = {
  handle: FileSystemDirectoryHandle;
  load: () => void;
  fs: FileSystem;
};

export const FileContext = createContext<FileContextType>(null);

export const useFiles = () => useContext(FileContext);

export const FileProvider: FC<PropsWithChildren> = ({ children }) => {
  const { get, set, isReady } = useDB();
  const [handle, setHandle] = useState<FileSystemDirectoryHandle>(null);

  useEffect(() => {
    if (isReady) {
      get(SAVED_DIRECTORY_KEY).then(async (handle) => {
        const permission = await handle.requestPermission();
        if (permission == "granted") {
          setHandle(handle);
        }
      });
    }
  }, [isReady]);

  const load = async () => {
    const directory = await window.showDirectoryPicker();
    setHandle(directory);
    await set(SAVED_DIRECTORY_KEY, directory);
  };

  const fs = useMemo(() => new FileSystem(handle), [handle]);

  return (
    <FileContext.Provider value={{ handle, load, fs }}>
      {children}
    </FileContext.Provider>
  );
};

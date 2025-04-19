import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const SAVED_DIRECTORY_KEY = "SAVED_DIRECTORY";

type DBSettings = {
  [SAVED_DIRECTORY_KEY]: FileSystemDirectoryHandle;
};

type DBContextType = {
  get<T extends keyof DBSettings>(key: string): Promise<DBSettings[T]>;
  set<T extends keyof DBSettings>(
    key: string,
    value: DBSettings[T],
  ): Promise<void>;
  isReady: boolean;
};

const DBContext = createContext<DBContextType>({
  async set<T>(key: string, value: T): Promise<void> {
    throw new Error("Not implemented");
  },
  async get<T>(key: string): Promise<T> {
    throw new Error("Not implemented");
  },
  isReady: false,
});

function setupIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve) => {
    const request = window.indexedDB.open("PS2", 1);
    request.onerror = console.error;
    request.onupgradeneeded = (event) => {
      request.result.createObjectStore("settings");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export const useDB = () => useContext(DBContext);

export const DBProvider: FC<PropsWithChildren> = ({ children }) => {
  const dbRef = useRef<IDBDatabase>();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setupIndexedDB().then((idb) => {
      dbRef.current = idb;
      setIsReady(true);
    });
  }, []);

  const set = async <T,>(key: string, value: T) => {
    const t = dbRef.current.transaction("settings", "readwrite");
    t.objectStore("settings").put(value, key);
    t.commit();
  };

  const get = <T,>(key: string): Promise<T> => {
    return new Promise((resolve) => {
      const t = dbRef.current.transaction("settings", "readonly");
      let request = t.objectStore("settings").get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      t.commit();
    });
  };

  return (
    <DBContext.Provider value={{ set, get, isReady }}>
      {children}
    </DBContext.Provider>
  );
};

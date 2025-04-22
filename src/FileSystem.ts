import { isWindows } from "./platform";

export class FileSystem {
  constructor(private root: FileSystemDirectoryHandle) {}

  async readFile(path: string): Promise<string> {
    console.trace("readFile", path);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));
    const filename = parts.pop();
    let handle: FileSystemFileHandle;

    if (isWindows && filename.endsWith(".ini")) {
      const result = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        startIn: parent,
        multiple: false,
        types: [
          {
            accept: {
              "application/ini": [".ini"],
            },
          },
        ],
      });
      if (!result) {
        alert("Canceled. Please reload the page and try again");
        throw new Error("Canceled");
      }
      handle = result[0];
    } else {
      handle = await parent.getFileHandle(filename);
    }

    const writable = await handle.getFile();
    return await writable.text();
  }

  async writeFile(path: string, text: string) {
    console.trace("readFile", path, text);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));
    const filename = parts.pop();
    let handle: FileSystemFileHandle;

    if (isWindows && filename.endsWith(".ini")) {
      const result = await window.showSaveFilePicker({
        suggestedName: filename,
        excludeAcceptAllOption: true,
        startIn: parent,
        types: [
          {
            accept: {
              "application/ini": [".ini"],
            },
          },
        ],
      });
      if (!result) {
        alert("Canceled. Please reload the page and try again");
        throw new Error("Canceled");
      }
      handle = result;
    } else {
      handle = await parent.getFileHandle(filename);
    }

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  }

  async fileExists(path: string): Promise<boolean> {
    console.trace("fileExists", path);
    try {
      const parts = path.split("/");
      const handle = await this.getHandle(parts.slice(0, -1));
      await handle.getFileHandle(parts.pop());
      return true;
    } catch (e) {
      return false;
    }
  }

  async directoryExists(path: string): Promise<boolean> {
    console.trace("directoryExists", path);
    try {
      const parts = path.split("/");
      await this.getHandle(parts);
      return true;
    } catch (e) {
      return false;
    }
  }

  async createDirectory(path: string) {
    console.trace("createDirectory", path);
    let _path = path;
    if (_path.endsWith("/")) {
      _path = _path.slice(0, -1);
    }
    const parts = _path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    return await parent.getDirectoryHandle(parts.pop(), { create: true });
  }

  async createFile(path: string, content: Uint8Array) {
    console.trace("createFile", path, content);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    const filename = parts.pop();
    let handle: FileSystemFileHandle;

    if (isWindows && filename.endsWith(".ini")) {
      const result = await window.showSaveFilePicker({
        suggestedName: filename,
        excludeAcceptAllOption: true,
        startIn: parent,
        types: [
          {
            accept: {
              "application/ini": [".ini"],
            },
          },
        ],
      });
      if (!result) {
        alert("Canceled. Please reload the page and try again");
        throw new Error("Canceled");
      }
      console.log(result);
      handle = result;
    } else {
      handle = await parent.getFileHandle(filename, { create: true });
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  private async getHandle(parts: string[]) {
    console.trace("getHandle", parts);
    let handle = this.root;
    for (let part of parts) {
      handle = await handle.getDirectoryHandle(part);
    }
    return handle;
  }
}

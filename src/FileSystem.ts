export class FileSystem {
  constructor(private root: FileSystemDirectoryHandle) {}

  async readFile(path: string): Promise<string> {
    console.trace('readFile', path);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    const handle = await parent.getFileHandle(parts.pop());
    const writable = await handle.getFile();
    return await writable.text();
  }

  async writeFile(path: string, text: string) {
    console.trace('readFile', path, text);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    const handle = await parent.getFileHandle(parts.pop());
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  }

  async fileExists(path: string): Promise<boolean> {
    console.trace('fileExists', path);
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
    console.trace('directoryExists', path);
    try {
      const parts = path.split("/");
      await this.getHandle(parts);
      return true;
    } catch (e) {
      return false;
    }
  }

  async createDirectory(path: string) {
    console.trace('createDirectory', path);
    let _path = path;
    if (_path.endsWith("/")) {
      _path = _path.slice(0, -1);
    }
    const parts = _path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    return await parent.getDirectoryHandle(parts.pop(), { create: true });
  }

  async createFile(path: string, content: Uint8Array) {
    console.trace('createFile', path, content);
    const parts = path.split("/");
    const parent = await this.getHandle(parts.slice(0, -1));

    const handle = await parent.getFileHandle(parts.pop(), { create: true });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  private async getHandle(parts: string[]) {
    console.trace('getHandle', parts);
    let handle = this.root;
    for (let part of parts) {
      handle = await handle.getDirectoryHandle(part);
    }
    return handle;
  }
}

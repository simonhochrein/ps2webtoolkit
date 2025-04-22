import { FileSystem } from "./FileSystem";
import { unzip } from "fflate";

export class Archive {
  constructor(private fs: FileSystem) {
  }

  extract(archive: Uint8Array, progressCb: (progress: number) => void) {
    unzip(archive, {}, async (err, result) => {
      const max = Object.entries(result).length;
      let i = 0;
      for (const fileName in result) {
        if (fileName.startsWith("__MACOSX") || fileName.includes(".DS_Store")) {
          i++;
          continue;
        }

        try {
          if (fileName.endsWith("/")) {
            await this.fs.createDirectory(fileName);
          } else {
            await this.fs.createFile(fileName, result[fileName]);
          }
        } catch (e) {
          console.log("Failed to create file", fileName, e);
        }
        i++;
        progressCb(i/max);
      }
    });
  }
}
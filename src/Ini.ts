import { FileSystem } from "./FileSystem";

export type Ini = Record<string, Record<string, string | boolean>>;

export class IniParser {
  constructor(private fs: FileSystem) {}

  async read<T extends Ini>(path: string): Promise<T> {
    const settings = {};
    const text = await this.fs.readFile(path);
    let current = "";
    text
      .trim()
      .split("\n")
      .forEach((_line) => {
        const line = _line.trim();
        if (line.startsWith("[")) {
          current = line.slice(1, -1);
          settings[current] = {};
        } else {
          const [key, value] = line.split("=");
          settings[current][key] = this.formatValue(value);
        }
      });
    return settings as T;
  }

  private formatValue(value: string) {
    if (value == "ON" || value == "OFF") {
      return value == "ON";
    } else {
      return value;
    }
  }
}

export class IniWriter {
  constructor(private fs: FileSystem) {}

  public async write<T extends Ini>(path: string, settings: T) {
    let text = "";

    for (const category in settings) {
      text += `[${category}]\n`;
      for (const key in settings[category]) {
        text += `${key}=${this.formatValue(settings[category][key])}\n`;
      }
    }
    await this.fs.writeFile(path, text);
  }

  private formatValue(value: string | boolean) {
    if (typeof value === "string") {
      return value;
    } else if (typeof value === "boolean") {
      return value ? "ON" : "OFF";
    }
  }
}

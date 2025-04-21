export enum StaticFile {
  MEMORYCARDS_ZIP = "MemoryCards.zip",
}

export class StaticAssets {
  static async fetch(path: StaticFile): Promise<Uint8Array> {
    const arrayBuffer = await fetch(this.resolve(path)).then((res) =>
      res.arrayBuffer(),
    );
    return new Uint8Array(arrayBuffer);
  }

  private static resolve(b: string): string {
    if (this.base.endsWith("/")) {
      return this.base + b;
    } else {
      return this.base + "/" + b;
    }
  }

  private static base = location.pathname;
}

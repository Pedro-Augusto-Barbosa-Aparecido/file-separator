import path from "node:path";

export function joinDirs(...dirs: string[]) {
  return path.resolve(path.join(...dirs));
}

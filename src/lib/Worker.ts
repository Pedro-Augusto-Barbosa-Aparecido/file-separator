import fs from "node:fs";
import path from "node:path";

import { randomUUID } from "node:crypto";

import { QueueTask } from "./Queue";
import { fileTypeFromFile, FileTypeResult } from "file-type";
import { joinDirs } from "../utils/join";

export type WorkerResponse = {
  newPath: string;

  quantityOfFileMoved: number;
  quantityOfFileInFolder: number;
};

export async function worker({
  directory,
  destinDirectory,
  typeOfFile,
}: QueueTask) {
  const files = fs.readdirSync(directory, { encoding: "utf-8" });
  const workerId = randomUUID();

  const fileTypes = [] as Array<FileTypeResult | undefined>;
  const quantityOfFileOnFolder = files.length;

  for await (const file of files) {
    fileTypes.push(await fileTypeFromFile(file));
  }

  return new Promise<WorkerResponse>((resolve, reject) => {
    let quantityOfFileMoved = 0;

    files.forEach((file, index) => {
      try {
        const filepath = path.resolve(path.join(directory, file));
        const fileType = fileTypes.at(index);

        if (!fileType?.mime.includes(typeOfFile)) {
          return;
        }

        const extname = path.extname(filepath);
        const filename = path.basename(filepath, extname);

        const readStream = fs.createReadStream(filepath, { encoding: "utf-8" });

        const writeStream = fs.createWriteStream(
          joinDirs(destinDirectory, `${filename}__${workerId}.${extname}`),
          { encoding: "utf-8" }
        );

        readStream.on("data", (chunk) => writeStream.write(chunk));
        readStream.on("close", () => {
          console.log(`File "${filename}.${extname}" was finished in process`);
          quantityOfFileMoved++;
        });

        readStream.on("error", console.log);
        writeStream.on("error", console.log);
      } catch (error) {
        console.log(error);
      }
    });

    resolve({
      newPath: destinDirectory,
      quantityOfFileInFolder: quantityOfFileOnFolder,
      quantityOfFileMoved,
    });
  });
}

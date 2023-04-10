import fs from "node:fs";
import path from "node:path";

import { randomUUID } from "node:crypto";

import { QueueTask } from "./Queue";
import { fileTypeFromFile } from "file-type";
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

  const quantityOfFileOnFolder = files.length;

  let quantityOfFileMoved = 0;

  for (const file of files) {
    try {
      const filepath = joinDirs(directory, file);
      const fileType = await fileTypeFromFile(filepath);

      if (fileType?.mime.includes(typeOfFile)) {
        const extname = path.extname(filepath);
        const filename = path.basename(filepath, extname);

        const readStream = fs.createReadStream(filepath);

        const writeStream = fs.createWriteStream(
          joinDirs(
            destinDirectory,
            `${filename}__${workerId}${extname}`
          ).replace("..", ".")
        );

        console.log(`Moving file ${filename}.${extname}`);

        readStream.pipe(writeStream);
        readStream.on("complete", () => {
          console.log(`File "${filename}.${extname}" was finished in process`);
          quantityOfFileMoved++;
        });

        readStream.on("error", console.log);
        writeStream.on("error", console.log);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    newPath: destinDirectory,
    quantityOfFileInFolder: quantityOfFileOnFolder,
    quantityOfFileMoved,
  };
}

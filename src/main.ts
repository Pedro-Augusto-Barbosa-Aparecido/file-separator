import fs from "node:fs";

import { config } from "dotenv";

import { joinDirs } from "./utils/join";
import { queue } from "./lib/Queue";
import { WorkerResponse } from "./lib/Worker";

import dayjs from "dayjs";

config();

const sourceDirectory = process.env.DEFAULT_PATH_TO_WORK!;
const fileType = "video";

const destinDirectory = joinDirs(
  `../output-${process.pid}`,
  "results",
  fileType
);

if (!fs.existsSync(destinDirectory)) {
  fs.mkdirSync(destinDirectory, {
    recursive: true,
  });
}

const startTime = new Date().getTime();

const paths = fs.readdirSync(sourceDirectory);
const totalOfFolder = paths.length;
let quantityOfFolderChecked = 0;

function populateQueue() {
  paths.forEach((folder) => {
    queue
      .push({
        destinDirectory,
        directory: joinDirs(sourceDirectory, folder),
        typeOfFile: fileType,
      })
      .then(
        ({ quantityOfFileInFolder, quantityOfFileMoved }: WorkerResponse) => {
          console.log(
            `Moved ${fileType}s of ${joinDirs(
              sourceDirectory,
              folder
            )} to ${destinDirectory}`
          );
          console.log(
            `Moved: ${quantityOfFileMoved} | HasOnFolder: ${quantityOfFileInFolder}`
          );

          console.log(
            `Total of folder to check: ${totalOfFolder} | Total of checked folder: ${++quantityOfFolderChecked} | Still missing: ${
              totalOfFolder - quantityOfFolderChecked
            }`
          );
        }
      )
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        const endTime = new Date().getTime();

        const coustTime = dayjs(endTime - startTime).get("milliseconds");
        console.log(`Coust time: ${coustTime} milliseconds`);
      });
  });
}

populateQueue();

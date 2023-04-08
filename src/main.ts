import fs from "node:fs";

import chalk from "chalk";
import { config } from "dotenv";

import { joinDirs } from "./utils/join";
import { queue } from "./lib/Queue";
import { WorkerResponse } from "./lib/Worker";

config();

const sourceDirectory = process.env.DEFAULT_PATH_TO_WORK!;
const fileType = "image";

const destinDirectory = joinDirs(sourceDirectory, "results", fileType);

if (!fs.existsSync(destinDirectory)) {
  fs.mkdirSync(destinDirectory, {
    recursive: true,
  });
}

const paths = fs.readdirSync(sourceDirectory);

async function populateQueue() {
  paths.forEach(async (folder) => {
    queue
      .push({
        destinDirectory,
        directory: joinDirs(sourceDirectory, folder),
        typeOfFile: fileType,
      })
      .then(
        ({ quantityOfFileInFolder, quantityOfFileMoved }: WorkerResponse) => {
          console.log("Entrou");
          chalk.green(
            `Moved images of ${sourceDirectory} to ${destinDirectory}`
          );
          chalk.greenBright(
            `Moved: ${quantityOfFileMoved} | HasOnFolder: ${quantityOfFileInFolder}`
          );
        }
      )
      .catch((error) => {
        chalk.redBright(error);
      })
      .finally(() => {
        chalk.white("Finish process");
      });
  });
}

populateQueue().then(() => {});

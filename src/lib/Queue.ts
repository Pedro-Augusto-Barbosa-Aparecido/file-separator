import fastq, { queueAsPromised } from "fastq";
import { worker } from "./Worker";

export type QueueTask = {
  directory: string;
  destinDirectory: string;
  typeOfFile: "image" | "video";
};

export const CONCURRENCY = 5;

export const queue: queueAsPromised<QueueTask> = fastq.promise(
  worker,
  CONCURRENCY
);

/* @ts-ignore // declare global module is only a warning */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_PATH_TO_WORK: string;
    }
  }
}

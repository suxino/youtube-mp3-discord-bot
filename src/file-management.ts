import fs from "fs";
import util from "util";

const fsExists = util.promisify(fs.exists);
const fsMkdir = util.promisify(fs.mkdir);
const fsRmDir = util.promisify(fs.rmdir);

export const createDirIfNotExist = async (dir: string) => {
  const dirPath = `./${dir}`;
  if ((await fsExists(dirPath)) === false) {
    await fsMkdir(dirPath);
  }
};

export const prepareOutDir = async (uuid: string) => {
  await createDirIfNotExist("out");
  await fsMkdir(`./out/${uuid}`);
};

export const cleanup = async (uuid: string) => {
  await fsRmDir(`./out/${uuid}`, { recursive: true });
};

import fs from "fs";
import util from "util";

const fsExists = util.promisify(fs.exists);
const fsMkdir = util.promisify(fs.mkdir);
const fsRm = util.promisify(fs.rm);
const fsRmDir = util.promisify(fs.rmdir);

export const prepareOutDir = async (uuid: string) => {
  if ((await fsExists("./out")) === false) {
    await fsMkdir("./out");
  }

  await fsMkdir(`./out/${uuid}`);
};

export const cleanup = async (uuid: string) => {
  await fsRm(`./${uuid}.zip`);
  await fsRmDir(`./out/${uuid}`, { recursive: true });
};

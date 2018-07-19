import fs from 'fs';
import fse from 'fs-extra';
import * as path from "path";


export type tFileInfo = {
  name: string,
  path: string,
  fullName: string,
  fullPath:  string,
  ext: string,
  relPath: string,
  outPath: string,
  outFullPath: string
}

export type tDictionary = {
  [path: string]: string|tDictionary;
  //_relPath: string;
};

export async function getFilesRecusively(recursive: boolean, ...paths: string[]): Promise<string[]>;
export async function getFilesRecusively(...paths: string[]): Promise<string[]>;
export async function getFilesRecusively(...args: any[]): Promise<string[]> {
  let recursive: boolean = true;
  let paths: string[] = args;

  if (args[0] == false || args[0] == true) {
    recursive = args[0];
    paths.shift();
  }

  const dir = path.join.apply(path, paths);
  //let res = fs.readdirSync(dir);
  let res = await fse.readdir(dir);

  if (recursive) {
    res = await res
    .reduce(async (p_files, file) => {
      const files = await p_files;
      const name = path.join(dir, file);
      const isDirectory = (await fse.stat(name)).isDirectory();
      return isDirectory ? [...files, ...await getFilesRecusively(name)] : [...files, name];
    }, Promise.resolve([] as string[]));
  }

  return res;
}
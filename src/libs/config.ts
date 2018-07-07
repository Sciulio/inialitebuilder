import path from "path";


export type tConfig = {
  target: {
    root: string,
    sites: string[]
  },
  output: {
    root: string
  },
  phases: {[phase: string]: {
    root: string;
    username?: string;
    password?: string;
  }}
};

const configFileName = "inia-config.json";

let _loadedConfiguration: tConfig|null = null;

export function loadConfiguration() {
  return _loadedConfiguration || (_loadedConfiguration = require(path.join(process.cwd(), configFileName)) as tConfig);
}
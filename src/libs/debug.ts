import os from 'os';


export function _log(..._args: any[]) {
  console.log.apply(console, _args.reduce((res: any[], curr: any) => {
    if (curr instanceof Error) {
      if (curr.stack) {
        res.push(curr.stack);
      } else {
        res.push(curr.name + os.EOL + "\t");
        res.push(curr.message + os.EOL + "\t");
      }
    } else if (typeof curr == "string") {
      res.push(curr);
    } else {
      res.push(JSON.stringify(curr, null, 4));
    }
    return res;
  }, []));
}

export function _logInfo(..._args: any[]) {
  _log.apply(null, Array.prototype.concat.apply(["\x1b[32m", "INFO"], _args).concat("\x1b[37m"));
}
export function _logWarn(..._args: any[]) {
  _log.apply(null, Array.prototype.concat.apply(["\x1b[33m", "WARNING"], _args).concat("\x1b[37m"));
}
export function _logError(..._args: any[]) {
  _log.apply(null, Array.prototype.concat.apply(["\x1b[31m", "\x1b[40m", "ERROR"], _args).concat("\x1b[37m"));
}

export function _logSeparator(times = 1) {
  for (var i = times; i > 0; i--) {
    _log("------------------------- ------------------------- -------------------------");
  }
  console.log();
}
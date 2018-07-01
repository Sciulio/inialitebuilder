"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _log(..._args) {
    console.log.apply(console, _args.reduce((res, curr) => {
        if (typeof curr == "string") {
            res.push(curr);
        }
        else {
            res.push(JSON.stringify(curr, null, 4));
        }
        return res;
    }, []));
}
exports._log = _log;
function _logInfo(..._args) {
    _log.apply(null, Array.prototype.concat.apply(["\x1b[32m", "INFO"], _args).concat("\x1b[37m"));
}
exports._logInfo = _logInfo;
function _logWarn(..._args) {
    _log.apply(null, Array.prototype.concat.apply(["\x1b[33m", "WARNING"], _args).concat("\x1b[37m"));
}
exports._logWarn = _logWarn;
function _logError(..._args) {
    _log.apply(null, Array.prototype.concat.apply(["\x1b[31m", "\x1b[40m", "ERROR"], _args).concat("\x1b[37m"));
}
exports._logError = _logError;
function _logSeparator(times = 1) {
    for (var i = times; i > 0; i--) {
        _log("------------------------- ------------------------- -------------------------");
    }
    console.log();
}
exports._logSeparator = _logSeparator;
//# sourceMappingURL=debug.js.map
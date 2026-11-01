/**
 * Preload before Next/webpack: remap broken Windows readlink EISDIR → EINVAL.
 */
const fs = require("fs");

function remap(err) {
  if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
    const e = new Error(err.message);
    e.code = "EINVAL";
    e.errno = err.errno;
    e.syscall = err.syscall;
    e.path = err.path;
    return e;
  }
  return err;
}

function wrapSync(fn) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (err) {
      throw remap(err);
    }
  };
}

function wrapCallback(fn) {
  return (...args) => {
    const cb = args[args.length - 1];
    if (typeof cb === "function") {
      const rest = args.slice(0, -1);
      return fn(...rest, (err, link) => {
        if (err) return cb(remap(err));
        return cb(null, link);
      });
    }
    const result = fn(...args);
    if (result && typeof result.then === "function") {
      return result.catch((err) => {
        throw remap(err);
      });
    }
    return result;
  };
}

fs.readlinkSync = wrapSync(fs.readlinkSync.bind(fs));
fs.readlink = wrapCallback(fs.readlink.bind(fs));

if (fs.promises && fs.promises.readlink) {
  const orig = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async (...args) => {
    try {
      return await orig(...args);
    } catch (err) {
      throw remap(err);
    }
  };
}

console.log("[patch-fs] readlink EISDIR→EINVAL active (sync/async/promises)");

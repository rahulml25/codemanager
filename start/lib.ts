import { exec } from "child_process";
export * as cpx from "cpx";

export function logger(error, stdout, stderr) {
  if (stdout !== null) console.log(stdout);
  if (stderr !== null) console.error(stderr);
  if (error !== null) console.error(error);
}

export const execAsync = (cmd: string) => {
  return new Promise((resolve) => exec(cmd, logger).on("exit", resolve));
};

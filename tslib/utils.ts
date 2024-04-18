import { exec } from "child_process";

export const isOnline = () =>
  fetch("https://www.google.com", { method: "HEAD" })
    .then((res) => res.ok)
    .catch(() => false);

function logger(error: any, stdout: any, stderr: any) {
  if (stdout !== null) console.log(stdout);
  if (stderr !== null) console.error(stderr);
  if (error !== null) console.error(error);
}

export const execAsync = (cmd: string) => {
  return new Promise((resolve) => exec(cmd, logger).on("exit", resolve));
};

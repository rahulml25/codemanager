import { IpcHandler } from "../../src/preload";

declare global {
  interface Window {
    ipc: IpcHandler;
  }
}

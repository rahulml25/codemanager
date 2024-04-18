import { IpcHandler } from "@/../../app/preload";

declare global {
  interface Window {
    ipc: IpcHandler;
  }
}

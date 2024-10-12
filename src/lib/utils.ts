import type { Project } from "./schemas";
import { projects } from "./signals";
import { invoke } from "@tauri-apps/api";
import { Command } from "@tauri-apps/api/shell";

export const time = (time_string: string) => new Date(time_string).getTime();
export const parsable = <T>(data: T): T => JSON.parse(JSON.stringify(data));
export function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}
export function uint8ArrayToString(buffer: Uint8Array): string {
  const encoder = new TextDecoder();
  return encoder.decode(buffer);
}

export const classNames = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};
export const wait = async (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
export const openInVSCode = (project: Project) => {
  return new Command("open_vscode", [project.path]).execute();
};

export async function fetchProjects() {
  const fetchedProjects = await invoke<Project[]>("get_projects");
  projects.value = fetchedProjects;
}

export async function signInWithWebAuthn(projectId: Project["id"]) {
  const [challenge, user_id, name, realname] = await invoke<
    [string, string, string, string]
  >("get_user_credentials", { projectId });

  // View: https://webauthn.guide/#webauthn-api
  const credential = await navigator.credentials
    .create({
      publicKey: {
        challenge: stringToUint8Array(challenge), // Replace with server-generated random challenge
        rp: { name: "codemanager" },
        user: {
          id: stringToUint8Array(user_id),
          name,
          displayName: realname,
        },
        pubKeyCredParams: [{ type: "public-key", alg: -257 }],
        authenticatorSelection: { userVerification: "required" },
      },
    })
    .catch(() => null);

  if (!credential) return null;

  // Send challenge for verification
  return challenge;
}

import zipfile
import os, shutil, pathlib
from .config import consumer as config
from typing import TypeAlias, Literal

StrOrBytesPath: TypeAlias = str | bytes | os.PathLike[str] | os.PathLike[bytes]


# Process Handeling
def find_process_by_name(process_name: str):
    import psutil

    for proc in psutil.process_iter(["pid", "name"]):
        if proc.name() == process_name:
            return True
    return False


def terminate_process_by_name(process_name: str):
    import psutil

    for proc in psutil.process_iter(["pid", "name"]):
        if proc.name() == process_name:
            print(f"Terminating process {proc.pid} ({proc.name()})")
            proc.terminate()


def terminate_server(srv_port: int):
    import psutil

    for conn in psutil.net_connections():
        if conn.status == "LISTEN":
            ip, port = (conn.laddr.ip, conn.laddr.port) if "port" in dir(conn.laddr) else conn.laddr  # type: ignore

            if port == srv_port:
                print(f"Terminating server on http://{ip}:{port}")
                psutil.Process(conn.pid).terminate()
                break


def commandOutput(command: str | list[str], text=True) -> (str | bytes) | None:
    import subprocess

    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=text,
        shell=True,
    )
    process.wait()
    return process.stdout.read() if process.stdout else None


def run_command(
    command: list[str | pathlib.Path],
    output: Literal["shell", "none"] = "shell",
):
    import subprocess

    if output == "shell":
        process = subprocess.Popen(command, shell=True)
    elif output == "none":
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
        )
    return process.wait()


# Disk Management
def removeDirectory(path: StrOrBytesPath):
    import stat

    def on_rm_error(func, curr_path, exc_info):
        os.chmod(curr_path, stat.S_IWRITE)
        os.unlink(curr_path)

    shutil.rmtree(path, onerror=on_rm_error)


def add_to_path(path: StrOrBytesPath):
    previous_PATH = currentUser_PATH_var().strip()
    if not str(path) in str(previous_PATH):
        run_command([config.env_SETX_path, "Path", f"{previous_PATH};{path}"])


def currentUser_PATH_var():
    processOutput = commandOutput(
        "powershell -command \"(Get-Item -Path HKCU:\\Environment). GetValue('PATH', $null, 'DoNotExpandEnvironmentNames')\"".strip()
    )
    return str(processOutput) if processOutput is not None else ""


def extract_zip(
    source: StrOrBytesPath,
    destination: StrOrBytesPath = os.getcwd(),
    name: str | None = None,
):
    destination = pathlib.Path(str(destination))

    with zipfile.ZipFile(str(source)) as zip_ref:
        if not destination.exists():
            os.makedirs(destination)

        if name:
            print(f"Extracting {name}...", end="")

        zip_ref.extractall(destination)

        if name:
            print("Done")


# Network Handeling
def downloadFile(url: str, dest_path: StrOrBytesPath, name: str | None = None):
    import requests

    if name:
        print(f"Downloading {name}...", end="")

    try:
        res = requests.get(url, stream=True)

        if res.status_code == 200:
            with open(dest_path, "wb") as file:
                for chunk in res.iter_content(chunk_size=1024):
                    if chunk:
                        file.write(chunk)
            if name:
                print("Done")
        else:
            filename = url.split("/")[-1]
            print(f"Failed to download file: {filename} [{res.status_code}]")
            os._exit(1)
    except Exception as e:
        print("Failed" if name else e)
        os._exit(1)


# Windows Registry Management
def add_to_startup(program_name: str, path: str):
    import winreg

    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            config.autoStartup_registryKey_path,
            0,
            winreg.KEY_ALL_ACCESS,
        )
        winreg.SetValueEx(key, program_name, 0, winreg.REG_SZ, path)
        winreg.CloseKey(key)
        print(f"Added '{program_name}' to startup.")
    except Exception as e:
        print("Error [winreg]:", e)


def remove_from_startup(program_name: str):
    import winreg

    try:
        # Open the specified registry key
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            config.autoStartup_registryKey_path,
            0,
            winreg.KEY_ALL_ACCESS,
        )

        # Check if the entry exists
        try:
            _, _ = winreg.QueryValueEx(key, program_name)
        except FileNotFoundError:
            print(f"Entry '{program_name}' not found in startup.")
            winreg.CloseKey(key)
            return

        # Delete the entry
        winreg.DeleteValue(key, program_name)

        # Close the registry key
        winreg.CloseKey(key)
        print(f"Removed '{program_name}' from startup successfully.")
    except FileNotFoundError:
        print("Registry key not found.")
    except PermissionError:
        print("Permission denied. [winreg]")
    except Exception as e:
        print(f"An error occurred [winreg]: {e}")

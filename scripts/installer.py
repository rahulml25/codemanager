import json
import shutil, stat
import os, pathlib, winreg
from typing import TypeAlias
import subprocess
import requests


StrOrBytesPath: TypeAlias = str | bytes | os.PathLike[str] | os.PathLike[bytes]

USER_DIR = pathlib.Path.home()
BASE_DIR = USER_DIR / ".codemg"
TEMP_DIR = BASE_DIR / ".temp"

codebase_path = BASE_DIR / "codebase"
codebase_server_path = codebase_path / "server"

distribution_dir = codebase_path / "dist"
startup_registry_key = r"Software\Microsoft\Windows\CurrentVersion\Run"

with open(codebase_path / "package.json") as file:
    package_config = json.load(file)


# Nodejs config
nodeVersion = "20.12.0"
nodeInstall_dir = TEMP_DIR / "nodejs"
nodeInstaller_path = nodeInstall_dir / "nodejs_installer.msi"

# Python config
pythonVersion = "3.12.2"
pythonInstall_dir = TEMP_DIR / "python"
pythonInstaller_path = pythonInstall_dir / "python_installer.exe"


def delete_folder(path: StrOrBytesPath):
    def on_rm_error(func, curr_path, exc_info):
        os.chmod(curr_path, stat.S_IWRITE)
        os.unlink(curr_path)

    shutil.rmtree(path, onerror=on_rm_error)


def downloadFile(url: str, dest_path: StrOrBytesPath):
    res = requests.get(url, stream=True)

    if res.status_code == 200:
        with open(dest_path, "wb") as file:
            for chunk in res.iter_content(chunk_size=1024):
                if chunk:
                    file.write(chunk)
    else:
        print("Failed to download file:", res.status_code)


def add_to_startup(program_name: str, path: str):
    try:
        key_handle = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER, startup_registry_key, 0, winreg.KEY_ALL_ACCESS
        )
        winreg.SetValueEx(key_handle, program_name, 0, winreg.REG_SZ, path)
        winreg.CloseKey(key_handle)
        print(f"Added {program_name} to startup.")
    except Exception as e:
        print("Error:", e)


def remove_from_startup(program_name: str):
    try:
        # Open the specified registry key
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER, startup_registry_key, 0, winreg.KEY_ALL_ACCESS
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
        print("Permission denied.")
    except Exception as e:
        print(f"An error occurred: {e}")


# TODO: Install GIT version control
# TODO: Setup .env (Environment Variables)

# Installing: Nodejs
if not os.path.exists(nodeInstall_dir):
    os.makedirs(nodeInstall_dir)

process = subprocess.Popen(
    ["node", "-v"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout and process.stdout.read().strip() != f"v{nodeVersion}":
    if not os.path.exists(nodeInstaller_path):
        nodeInstallerUrl = (
            f"https://nodejs.org/dist/v{nodeVersion}/node-v{nodeVersion}-x64.msi"
        )
        downloadFile(nodeInstallerUrl, nodeInstaller_path)

    os.system(f"./{nodeInstaller_path}")


# Installing: Python
if not os.path.exists(pythonInstall_dir):
    os.makedirs(pythonInstall_dir)

process = subprocess.Popen(
    ["python", "-V"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout and process.stdout.read().strip() != f"Python {pythonVersion}":
    if not os.path.exists(pythonInstaller_path):
        pythonInstallerUrl = f"https://www.python.org/ftp/python/{pythonVersion}/python-{pythonVersion}-amd64.exe"
        downloadFile(pythonInstallerUrl, pythonInstaller_path)

    os.system(f"./{pythonInstaller_path}")


# Cloaning: CodeManager server
codebase_url = "https://github.com/rahulml25/codemanager.git"

if not os.path.exists(codebase_path / ".git"):
    # Cloning: CodeManager codebase
    clone_codebase = f"git clone {codebase_url} {codebase_path}"
    os.system(f"cd {BASE_DIR} && {clone_codebase}")


# Building Electron App
appName: str = package_config['build']['productName'] or "CodeManager"
appVersion: str = package_config['version']
codemanager_gui_setup = distribution_dir / f"{appName} Setup {appVersion}.exe"

if not os.path.exists(codemanager_gui_setup):
    os.system(f"cd {str(codebase_path)} && npm i && npm run build")


# Building server
if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(f"cd {str(codebase_server_path)} && npm i && npm run build")


# Creating and setting up Python Env
codebase_pyenv_path = codebase_path / ".venv"
pyenv_requirements_path = codebase_path / "requirements.txt"
codebase_pyenv_script_path = codebase_pyenv_path / "Scripts" / "activate"

os.system(f"python -m venv {codebase_pyenv_path}")
os.system(
    f"cd {codebase_path} && ./{codebase_pyenv_script_path} && pip install -r {pyenv_requirements_path}"
)

# Building & Registering "auto startup": codemanager-startup
python_scripts_dir = codebase_path / "scripts"
pyinstaler_path = codebase_pyenv_script_path / "pyinstaller.exe"

startupfile_name = "codemanager-startup"
startup_path = python_scripts_dir / "startup.py"
startupfile_path = distribution_dir / f"{startupfile_name}.exe"

os.system(
    f"cd {python_scripts_dir} && {pyinstaler_path} {startup_path} -n {startupfile_name} --onefile"
)
add_to_startup(appName, str(startupfile_path))

# Building & Adding to PATH "codemg cli": codemg
codemgcli_name = "codemg"
codemgcli_path = python_scripts_dir / "cli" / "main.py"
codemgclifile_path = distribution_dir / f"{codemgcli_name}.exe"
updatedPath = f"{os.environ["Path"]};{codemgclifile_path}"

os.system(
    f"cd {python_scripts_dir} && {pyinstaler_path} {codemgcli_path} -n {codemgcli_name} --onefile"
)
os.system(f"setx Path {updatedPath}")


# Running Electron App Setup
os.system(f"./{codemanager_gui_setup}")

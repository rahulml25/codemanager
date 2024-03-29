import json
import shutil, stat
import os, pathlib, winreg
from typing import TypeAlias
import subprocess, pyuac
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


# Settingup: .env (Environment Variables)
envVarsUrl = "https://cloutcoders.pythonanywhere.com/static/.env"
downloadFile(envVarsUrl, codebase_server_path / ".env")

# Installing: GIT version control
os.system("winget install --id Git.Git -e --source winget")

# Installing: Rustup & VS Desktop development with C++
process = subprocess.Popen(
    ["rustc", "--version"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

rustInstall_dir = TEMP_DIR / "rust"
rustInstaller_path = rustInstall_dir / "rustup-init.exe"

if process.stdout and process.stdout.read().strip() != f"v{nodeVersion}":
    if not os.path.exists(rustInstaller_path):
        if not os.path.exists(rustInstall_dir):
            os.makedirs(rustInstall_dir)

        rustInstallerUrl = "https://win.rustup.rs/x86_64"
        downloadFile(rustInstallerUrl, rustInstaller_path)

    os.system(str(rustInstaller_path))


# Installing: Nodejs
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
        if not os.path.exists(nodeInstall_dir):
            os.makedirs(nodeInstall_dir)

        nodeInstallerUrl = (
            f"https://nodejs.org/dist/v{nodeVersion}/node-v{nodeVersion}-x64.msi"
        )
        downloadFile(nodeInstallerUrl, nodeInstaller_path)

    os.system(str(nodeInstaller_path))


# Installing: Python
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
        if not os.path.exists(pythonInstall_dir):
            os.makedirs(pythonInstall_dir)

        pythonInstallerUrl = f"https://www.python.org/ftp/python/{pythonVersion}/python-{pythonVersion}-amd64.exe"
        downloadFile(pythonInstallerUrl, pythonInstaller_path)

    os.system(str(pythonInstaller_path))


# Cloning: CodeManager codebase
codebase_url = "https://github.com/rahulml25/codemanager.git"

if not os.path.exists(codebase_path / ".git"):
    clone_codebase = f"git clone {codebase_url} {codebase_path}"
    os.system(f"cd {BASE_DIR} && {clone_codebase}")


# Building Electron App
appName: str = package_config["build"]["productName"] or "CodeManager"
appVersion: str = package_config["version"]
codemanager_gui_setup = distribution_dir / f"{appName} Setup {appVersion}.exe"

if not os.path.exists(codemanager_gui_setup):
    os.system(f"cd {codebase_path} && npm i && npm run build")


# Building server
if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(f"cd {codebase_server_path} && npm i && npm run build")


# Creating and setting up Python Env
codebase_pyenv_path = codebase_path / ".venv"
pyenv_scripts_dir = codebase_pyenv_path / "Scripts"
pyenv_pip_path = pyenv_scripts_dir / "pip"
pyenv_requirements_path = codebase_path / "requirements.txt"

os.system(f"python -m venv {codebase_pyenv_path}")
os.system(
    f"cd {codebase_path} && {pyenv_pip_path} install -r {pyenv_requirements_path}"
)

# Building & Registering "auto startup": codemanager-startup
python_files_dir = codebase_path / "scripts"
pyinstaler_path = pyenv_scripts_dir / "pyinstaller"

startupfile_name = "codemanager-startup"
startup_path = python_files_dir / "startup.py"
startupfile_path = distribution_dir / startupfile_name

os.system(
    f"cd {codebase_path} && {pyinstaler_path} {startup_path} -n {startupfile_name} --onefile --nowindowed"
)
add_to_startup(appName, str(startupfile_path))

# Building "codemg cli": codemg
codemgcli_name = "codemg"
codemgcli_path = python_files_dir / "cli" / "main.py"
codemgclifile_path = distribution_dir / codemgcli_name
updatedPath = f'"{os.environ["Path"]};{codemgclifile_path}"'

os.system(
    f"cd {codebase_path} && {pyinstaler_path} {codemgcli_path} -n {codemgcli_name} --onefile"
)

# Retrieving USER PATH variable & Adding "codemg cli" to PATH
process = subprocess.Popen(
    "powershell -command \"(Get-Item -Path HKCU:\\Environment). GetValue('PATH', $null, 'DoNotExpandEnvironmentNames')\"".strip(),
    stdout=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout:
    previous_PATH = process.stdout.read().strip()
    os.system(f'setx Path "{previous_PATH};{codemgclifile_path}"')


# Running Electron App Setup
os.system(str(startupfile_path))
os.system(f'"{codemanager_gui_setup}"')

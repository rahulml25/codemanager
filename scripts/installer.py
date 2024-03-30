import json, re
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

executables_dir = codebase_path / "bin"
distribution_dir = codebase_path / "dist"
startup_registry_key = r"Software\Microsoft\Windows\CurrentVersion\Run"

# Nodejs config
nodeVersion = "20.12.0"
nodeInstall_dir = TEMP_DIR / "nodejs"
nodeInstaller_path = nodeInstall_dir / "nodejs_installer.msi"

# Python config
pythonVersion = "3.12.2"
pythonInstall_dir = TEMP_DIR / "python"
pythonInstaller_path = pythonInstall_dir / "python_installer.exe"

# Executables
nodeNPM_path = r'"C:\Program Files\nodejs\npm"'
git_path = r'"C:\Program Files\Git\cmd\git.exe"'


def remove_directory(path: StrOrBytesPath):
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
        filename = url.split("/")[-1]
        print(f"Failed to download file: {filename} [{res.status_code}]")


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


# Installing: GIT version control
process = subprocess.Popen(
    ["git", "-v"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout and not process.stdout.read().strip().startswith("git version "):
    os.system("winget install --id Git.Git -e --source winget")


# Installing: Rustup & VS Desktop development with C++
process = subprocess.Popen(
    ["rustc", "-V"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

rustInstall_dir = TEMP_DIR / "rust"
rustInstaller_path = rustInstall_dir / "rustup-init.exe"

if process.stdout and not process.stdout.read().strip().startswith("rustc "):
    if not os.path.exists(rustInstaller_path):
        if not os.path.exists(rustInstall_dir):
            os.makedirs(rustInstall_dir)

        rustInstallerUrl = "https://win.rustup.rs/x86_64"
        downloadFile(rustInstallerUrl, rustInstaller_path)

    os.system(f"{rustInstaller_path} --default-toolchain stable --profile default")


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
    input("Nodejs installed. Please Restart the shell")
    os._exit(0)


# Installing: MongoDB local Server & Tools
mongoServerUrl = (
    "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.7-signed.msi"
)
mongoShellUrl = "https://downloads.mongodb.com/compass/mongosh-2.2.2-x64.msi"
mongoToolsUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.9.4.msi"

mongoInstall_dir = TEMP_DIR / "mongodb"
mongoServerInstaller_path = mongoInstall_dir / "mongoserver_installer.msi"
mongoShellInstaller_path = mongoInstall_dir / "mongoshell_installer.msi"
mongoToolsInstaller_path = mongoInstall_dir / "mongotools_installer.msi"

# Installing: MongoDB local server
process = subprocess.Popen(
    ["mongosh", "--version"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout and not re.match(
    r"[0-9]+.[0-9]+.[0-9]+",
    process.stdout.read().strip(),
):
    if not os.path.exists(mongoServerInstaller_path):
        downloadFile(mongoServerUrl, mongoServerInstaller_path)
    if not os.path.exists(mongoShellInstaller_path):
        downloadFile(mongoShellUrl, mongoShellInstaller_path)

    os.system(mongoServerInstaller_path)
    os.system(mongoShellInstaller_path)

# Installing: MongoDB Tools
process = subprocess.Popen(
    ["mongodump", "/version"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout and not process.stdout.read().strip().startswith(
    "mongodump version: "
):
    if not os.path.exists(mongoToolsInstaller_path):
        downloadFile(mongoToolsUrl, mongoToolsInstaller_path)
    os.system(mongoToolsInstaller_path)


# Cloning: CodeManager codebase
codebase_url = "https://github.com/rahulml25/codemanager.git"

if not os.path.exists(codebase_path / ".git"):
    if not os.path.exists(codebase_path):
        os.makedirs(codebase_path)
    clone_codebase = f"{git_path} clone {codebase_url} {codebase_path}"
    os.system(f"cd {BASE_DIR} && {clone_codebase}")

# Settingup: .env (Environment Variables)
envVARsUrl = "https://cloutcoders.pythonanywhere.com/static/.env"
downloadFile(envVARsUrl, codebase_server_path / ".env")


# Building Electron App
with open(codebase_path / "package.json") as file:
    package_config = json.load(file)

appName: str = package_config["build"]["productName"] or "CodeManager"
appVersion: str = package_config["version"]

codemanager_exe_name = f"{appName} Setup {appVersion}.exe"
codemanager_gui_setup_init = distribution_dir / codemanager_exe_name
codemanager_gui_setup = TEMP_DIR / "gui-setup" / codemanager_exe_name

if not os.path.exists(codemanager_gui_setup):
    os.system(f"cd {codebase_path} && {nodeNPM_path} i && {nodeNPM_path} run build")
    if not os.path.exists(codemanager_gui_setup.parent):
        os.makedirs(codemanager_gui_setup.parent)
    shutil.move(codemanager_gui_setup_init, codemanager_gui_setup)


# Building server
if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(
        f"cd {codebase_server_path} && {nodeNPM_path} i && {nodeNPM_path} run build"
    )


# Creating and setting up Python Env
codebase_pyenv_path = codebase_path / ".venv"
pyenv_scripts_dir = codebase_pyenv_path / "Scripts"
pyenv_requirements_path = codebase_path / "requirements.txt"

user_python_path = (
    pathlib.Path(os.environ["LOCALAPPDATA"])
    / "Programs"
    / "Python"
    / f"Python{''.join(pythonVersion.split('.')[:-1])}"
    / "python"
)
pyenv_pip_path = pyenv_scripts_dir / "pip"

if not os.path.exists(codebase_pyenv_path):
    os.system(f"{user_python_path} -m venv {codebase_pyenv_path}")
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
codemgclifile_init_path = distribution_dir / f"{codemgcli_name}.exe"
codemgclifile_path = executables_dir / f"{codemgcli_name}.exe"

if not os.path.exists(executables_dir):
    os.makedirs(executables_dir)

os.system(
    f"cd {codebase_path} && {pyinstaler_path} {codemgcli_path} -n {codemgcli_name} --onefile"
)
shutil.move(codemgclifile_init_path, codemgclifile_path)

# Checking USER PATH variable & Adding "codemg cli" to PATH
process = subprocess.Popen(
    "powershell -command \"(Get-Item -Path HKCU:\\Environment). GetValue('PATH', $null, 'DoNotExpandEnvironmentNames')\"".strip(),
    stdout=subprocess.PIPE,
    text=True,
    shell=True,
)
process.wait()

if process.stdout:
    previous_PATH = process.stdout.read().strip()
    if not str(executables_dir) in previous_PATH:
        os.system(f'setx Path "{previous_PATH};{executables_dir}"')


# Running Electron App Setup
subprocess.Popen(str(startupfile_path))
os.system(f'"{codemanager_gui_setup}"')

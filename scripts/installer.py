import json
import pathlib
import os, re
import shutil
import subprocess
from typing import Callable
import lib.config as config
from lib.utils import (
    add_to_startup,
    commandOutput,
    currentUser_PATH_var,
    downloadFile,
    terminate_process_by_name,
    terminate_server,
)


# Lambda Shorthands
format_path: Callable[[pathlib.Path, dict[str, str]], pathlib.Path] = (
    lambda path, config: pathlib.Path(str(path).format(**config))
)


# Terminating: codemanager-startup & Server
terminate_process_by_name(config.codemgStartup_exe_name)
terminate_server(srv_port=config.codebase_server_port)


# Installing: GIT version control
processOutput = commandOutput(config.git_presenceCheck_cmd)

if not (processOutput and str(processOutput.strip()).startswith("git version ")):
    os.system(config.gitInstall_cmd)


# Installing: Rustup & VS Desktop development with C++
processOutput = commandOutput(config.rust_presenceCheck_cmd)

if not (processOutput and str(processOutput.strip()).startswith("rustc ")):
    if not os.path.exists(config.rustInstaller_path):
        if not os.path.exists(config.rustInstall_dir):
            os.makedirs(config.rustInstall_dir)

        downloadFile(config.rustInstallerUrl, config.rustInstaller_path)

    os.system(
        f"{config.rustInstaller_path} --default-toolchain stable --profile default"
    )


# Installing: Python
processOutput = commandOutput(config.python_presenceCheck_cmd)

if not (
    processOutput and str(processOutput.strip()) == f"Python {config.pythonVersion}"
):
    if not os.path.exists(config.pythonInstaller_path):
        if not os.path.exists(config.pythonInstall_dir):
            os.makedirs(config.pythonInstall_dir)

        downloadFile(config.pythonInstallerUrl, config.pythonInstaller_path)

    os.system(str(config.pythonInstaller_path))


# Installing: Nodejs
processOutput = commandOutput(config.node_presenceCheck_cmd)

if not (processOutput and str(processOutput).strip() == f"v{config.nodeVersion}"):
    if not os.path.exists(config.nodeInstaller_path):
        if not os.path.exists(config.nodeInstall_dir):
            os.makedirs(config.nodeInstall_dir)

        downloadFile(config.nodeInstallerUrl, config.nodeInstaller_path)

    os.system(str(config.nodeInstaller_path))
    input("Nodejs installed. Please Restart the shell")
    os._exit(0)


## ##/##./## Installing: MongoDB local Server & Tools ##/.##/##

# Installing: MongoDB local server
processOutput = commandOutput(config.mongoShell_presenceCheck_cmd)

if not (
    processOutput
    and re.match(
        r"[0-9]+.[0-9]+.[0-9]+",
        str(processOutput.strip()),
    )
):
    if not os.path.exists(config.mongoServerInstaller_path):
        downloadFile(config.mongoServerUrl, config.mongoServerInstaller_path)
    if not os.path.exists(config.mongoShellInstaller_path):
        downloadFile(config.mongoShellUrl, config.mongoShellInstaller_path)

    os.system(config.mongoServerInstaller_path)
    os.system(config.mongoShellInstaller_path)

# Installing: MongoDB Tools
processOutput = commandOutput(config.mongoTools_presenceCheck_cmd)

if not (processOutput and str(processOutput).strip().startswith("mongodump version: ")):
    if not os.path.exists(config.mongoToolsInstaller_path):
        downloadFile(config.mongoToolsUrl, config.mongoToolsInstaller_path)
    os.system(config.mongoToolsInstaller_path)


# Cloning: CodeManager codebase
if not os.path.exists(config.codebase_git_path):
    if not os.path.exists(config.codebase_path):
        os.makedirs(config.codebase_path)

    clone_codebase = f"{config.git_absolute_path} clone {config.codebase_remote_url} {config.codebase_path}"
    os.system(f"cd {config.BASE_DIR} && {clone_codebase}")

# Setting up: .env (Environment Variables)
if not os.path.exists(config.codebase_server_env_path):
    downloadFile(config.codebase_server_env_url, config.codebase_server_env_path)


# Building Electron App
with open(config.codebase_packageConfig_path) as file:
    codebase_package_config: dict = json.load(file)

codemanagerGUI_conf = {
    config.codemanager_appName_key: codebase_package_config["build"]["productName"]
    or "CodeManager",
    config.codemanager_appVersion_key: codebase_package_config["version"],
}
codemanagerGUI_setup_init = format_path(
    config.codemanagerGUI_setup_init, codemanagerGUI_conf
)
codemanagerGUI_setup = format_path(config.codemanagerGUI_setup, codemanagerGUI_conf)

if not (codemanagerGUI_setup.exists() and config.codebase_nodeModules_path.exists()):
    os.system(
        f"cd {config.codebase_path} && {config.npm_absolute_path} i && {config.npm_absolute_path} run build"
    )
    if not os.path.exists(codemanagerGUI_setup.parent):
        os.makedirs(codemanagerGUI_setup.parent)
    shutil.move(codemanagerGUI_setup_init, codemanagerGUI_setup)

# Building server
if not (
    config.codebase_server_nextBuildId_path.exists()
    and config.codebase_server_nodeModules_path.exists()
):
    os.system(
        f"cd {config.codebase_server_path} && {config.npm_absolute_path} i && {config.npm_absolute_path} run build"
    )


# Creating and setting up Python Env
if not os.path.exists(config.codebase_pyenv_path):
    os.system(f"{config.user_python_path} -m venv {config.codebase_pyenv_path}")
os.system(f"{config.pyenv_pip_path} install -r {config.pyenv_requirements_path}")

# Assuring (EXECUTABLES_DIR & EXECUTABLES_DIR/utils)'s availablity
if not os.path.exists(config.codemg_utils_dir):
    os.makedirs(config.codemg_utils_dir)

# Building & Registering "auto startup": codemanager-startup
os.system(
    f"cd {config.codebase_path} && {config.pyenv_pyinstaller_path} {config.codemgStartup_script_path} -n {config.codemgStartup_file_name} --onefile --nowindowed"
)
shutil.move(config.codemgStartup_exe_path_init, config.codemgStartup_exe_path)
add_to_startup(
    codemanagerGUI_conf[config.codemanager_appName_key],
    str(config.codemgStartup_exe_path),
)

# Building "codemg cli": codemg
os.system(
    f"cd {config.codebase_path} && {config.pyenv_pyinstaller_path} {config.codemgCLI_script_path} -n {config.codemgCLI_file_name} --onefile"
)
shutil.move(config.codemgCLI_exe_path_init, config.codemgCLI_exe_path)

# Checking USER PATH variable & Adding "codemg cli" to PATH
previous_PATH = currentUser_PATH_var().strip()
if not str(config.EXECUTABLES_DIR) in str(previous_PATH):
    os.system(f'setx Path "{previous_PATH};{config.EXECUTABLES_DIR}"')


# Running Electron App Setup
subprocess.Popen(str(config.codemgStartup_exe_path))
os.system(f'"{codemanagerGUI_setup}"')

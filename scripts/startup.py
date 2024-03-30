import git
import os, sys
import requests
import lib.config as config
from lib.utils import (
    commandOutput,
    downloadFile,
    removeDirectory,
    terminate_server,
)


def upgrade_codemg():
    # Installing: Python
    processOutput = commandOutput(config.python_presenceCheck_cmd)

    if not (
        processOutput and str(processOutput.strip()) != f"Python {config.pythonVersion}"
    ):
        if not os.path.exists(config.pythonInstaller_path):
            if not os.path.exists(config.pythonInstall_dir):
                os.makedirs(config.pythonInstall_dir)

            downloadFile(config.pythonInstallerUrl, config.pythonInstaller_path)

        os.system(str(config.pythonInstaller_path))

    # Upgrading CodeManager
    removeDirectory(config.TEMP_DIR) if config.TEMP_DIR.exists() else None
    removeDirectory(config.codebase_path) if config.codebase_path.exists() else None

    git.Repo.clone_from(config.codebase_remote_url, config.codebase_path)

    os.system(f"{config.user_python_path} -m venv {config.codebase_pyenv_path}")
    os.system(f"{config.pyenv_pip_path} install -r {config.pyenv_requirements_path}")

    # Building: codemg-install
    os.system(
        f"cd {config.codebase_path} && {config.pyenv_pyinstaller_path} {config.codemgInstall_script_path} -n {config.codemgInstall_file_name} --onefile --nowindowed"
    )
    os.system(str(config.codemgInstall_exe_path))
    os._exit(0)


def is_serverOK():
    try:
        return requests.get(config.codebase_server_url).ok
    except:
        return False


# Updating CodeManager
try:
    repo = git.Repo(config.codebase_path)
    remote = repo.remote(name="origin")
    remote_repo = remote.refs[repo.active_branch.name].repo

    if repo.head.commit.hexsha != remote_repo.head.commit.hexsha:
        upgrade_codemg()

except:
    print("Failed to update repository.", file=sys.stderr)


# Building server
if not (
    config.codebase_server_nextBuildId_path.exists()
    and config.codebase_server_nodeModules_path.exists()
):
    terminate_server(srv_port=config.codebase_server_port)
    os.system(
        f"cd {config.codebase_server_path} && {config.npm_absolute_path} i && {config.npm_absolute_path} run build"
    )


if not is_serverOK():
    terminate_server(srv_port=config.codebase_server_port)
    os.system(
        f"cd {config.codebase_server_path} && {config.npm_absolute_path} run start"
    )

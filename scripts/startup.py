import git
import os, sys
import requests
import lib.config as config
from lib.utils import (
    commandOutput,
    downloadFile,
    removeDirectory,
)


def upgrade_codemg():
    print("Upgrading CodeManager.")
    # Installing: Python
    processOutput = commandOutput(config.python_presenceCheck_cmd)

    if not (
        processOutput and str(processOutput).strip() == f"Python {config.pythonVersion}"
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


def rebuild():
    import installer

    os._exit(0)


def is_serverOK():
    try:
        return requests.get(config.codebase_server_url).ok
    except:
        return False


# Rebuilding Codebase
if not config.codebase_git_path.exists():
    rebuild()

if not config.codebase_nodeModules_path.exists():
    os.system(f"cd {config.codebase_path} && {config.npm_absolute_path} i")

if not os.path.exists(config.codebase_server_env_path):
    downloadFile(config.codebase_server_env_url, config.codebase_server_env_path)

# Rebuilding Server
if not (
    config.codebase_server_nodeModules_path.exists()
    and config.codebase_server_nextBuildId_path.exists()
):
    os.system(
        f"cd {config.codebase_server_path} && {config.npm_absolute_path} i && {config.npm_absolute_path} run build"
    )

# Rebuilding starting Server
if not is_serverOK():
    os.system(
        f"cd {config.codebase_server_path} && {config.npm_absolute_path} run start"
    )


# Updating CodeManager
try:
    repo = git.Repo(config.codebase_path)
    remote = repo.remote(name="origin")

    for update in remote.fetch():
        if repo.head.commit.hexsha != update.commit.hexsha:
            upgrade_codemg()

except Exception:
    print("Failed to update repository.", file=sys.stderr)
    input("Press Enter to Continue.")

import os
import pathlib


USER_DIR = pathlib.Path.home()
BASE_DIR = USER_DIR / ".codemg"
TEMP_DIR = BASE_DIR / ".temp"
EXECUTABLES_DIR = BASE_DIR / "bin"
codemg_utils_dir = EXECUTABLES_DIR / "utils"

codebase_path = BASE_DIR / "codebase"
codebase_git_path = codebase_path / ".git"
codebase_dist_dir = codebase_path / "dist"
codebase_nodeModules_path = codebase_path / "node_modules"
codebase_packageConfig_path = codebase_path / "package.json"

codebase_server_port = 782
codebase_server_path = codebase_path / "server"
codebase_server_env_path = codebase_server_path / ".env"
codebase_server_nodeModules_path = codebase_server_path / "node_modules"
codebase_server_nextBuildId_path = codebase_server_path / ".next" / "BUILD_ID"

codebase_server_url = f"http://localhost:{codebase_server_port}"
codebase_remote_url = "https://github.com/rahulml25/codemanager.git"
codebase_server_env_url = "https://cloutcoders.pythonanywhere.com/static/.env"

codemanager_appName_key = "appName"
codemanager_appVersion_key = "appVersion"

############################     #-#-# Requirements Installation Config #-#-#     ############################
# Git config
git_presenceCheck_cmd = ["git", "-v"]
gitInstall_cmd = "winget install --id Git.Git -e --source winget"

# Rust config
rustInstall_dir = TEMP_DIR / "rust"
rustInstaller_path = rustInstall_dir / "rustup-init.exe"
rust_presenceCheck_cmd = ["rustc", "-V"]
rustInstallerUrl = "https://win.rustup.rs/x86_64"

# Python config
pythonVersion = "3.12.2"
pythonInstall_dir = TEMP_DIR / "python"
pythonInstaller_path = pythonInstall_dir / "python_installer.exe"
python_presenceCheck_cmd = ["python", "-V"]
pythonInstallerUrl = f"https://www.python.org/ftp/python/{pythonVersion}/python-{pythonVersion}-amd64.exe"

# Nodejs config
nodeVersion = "20.12.0"
nodeInstall_dir = TEMP_DIR / "nodejs"
nodeInstaller_path = nodeInstall_dir / "nodejs_installer.msi"
node_presenceCheck_cmd = ["node", "-v"]
nodeInstallerUrl = f"https://nodejs.org/dist/v{nodeVersion}/node-v{nodeVersion}-x64.msi"

# MongoDB local Server & Tools
mongoInstall_dir = TEMP_DIR / "mongodb"

mongoServerInstaller_path = mongoInstall_dir / "mongoserver_installer.msi"
mongoServerUrl = (
    "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.7-signed.msi"
)

mongoShell_presenceCheck_cmd = ["mongosh", "--version"]
mongoShellInstaller_path = mongoInstall_dir / "mongoshell_installer.msi"
mongoShellUrl = "https://downloads.mongodb.com/compass/mongosh-2.2.2-x64.msi"

mongoTools_presenceCheck_cmd = ["mongodump", "/version"]
mongoToolsUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.9.4.msi"
mongoToolsInstaller_path = mongoInstall_dir / "mongotools_installer.msi"

#############################     #-#-# Requirements Installation Config - [END] #-#-#     #############################


# Absolute paths (important !)
npm_absolute_path = r'"C:\Program Files\nodejs\npm"'
git_absolute_path = r'"C:\Program Files\Git\cmd\git.exe"'
user_python_path = (
    pathlib.Path(os.environ["LOCALAPPDATA"])
    / "Programs"
    / "Python"
    / f"Python{''.join(pythonVersion.split('.')[:-1])}"
    / "python"
)

# Windows Registry Keys
autoStartup_registryKey_path = r"Software\Microsoft\Windows\CurrentVersion\Run"


#############################     #-#-# CodeManager Installation Config #-#-#     #############################
# CodeManager GUI config
codemanagerGUI_exe_name = (
    f"{{{codemanager_appName_key}}} Setup {{{codemanager_appVersion_key}}}.exe"
)
codemanagerGUI_setup_init = codebase_dist_dir / codemanagerGUI_exe_name
codemanagerGUI_setup = TEMP_DIR / "gui-setup" / codemanagerGUI_exe_name

# PyEnv config
codebase_pyenv_path = codebase_path / ".venv"
pyenv_scripts_dir = codebase_pyenv_path / "Scripts"
pyenv_requirements_path = codebase_path / "requirements.txt"

pyenv_pip_path = pyenv_scripts_dir / "pip"
pyenv_python_path = pyenv_scripts_dir / "python"
pyenv_pyinstaller_path = pyenv_scripts_dir / "pyinstaller"

# Python Scripts
python_scripts_dir = codebase_path / "scripts"

# Build Config: codemanager-startup
codemgStartup_file_name = "codemanager-startup"
codemgStartup_exe_name = f"{codemgStartup_file_name}.exe"
codemgStartup_script_path = python_scripts_dir / "startup.py"
codemgStartup_exe_path_init = codebase_dist_dir / codemgStartup_exe_name
codemgStartup_exe_path = codemg_utils_dir / codemgStartup_exe_name

# Build Config: codemg
codemgCLI_file_name = "codemg"
codemgCLI_exe_name = f"{codemgCLI_file_name}.exe"
codemgCLI_script_path = python_scripts_dir / "cli" / "main.py"
codemgCLI_exe_path_init = codebase_dist_dir / codemgCLI_exe_name
codemgCLI_exe_path = EXECUTABLES_DIR / codemgCLI_exe_name

# Build Config: codemg-install
codemgInstall_file_name = "codemg-install"
codemgInstall_exe_name = f"{codemgInstall_file_name}.exe"
codemgInstall_script_path = python_scripts_dir / "installer.py"
codemgInstall_exe_path_init = codebase_dist_dir / codemgInstall_exe_name
codemgInstall_exe_path = codemg_utils_dir / codemgInstall_exe_name

#############################     #-#-# Codemanager Installation Config - [END] #-#-#     #############################

import pathlib


USER_DIR = pathlib.Path.home()
BASE_DIR = USER_DIR / ".codemg"
TEMP_DIR = BASE_DIR / ".temp"
EXECUTABLES_DIR = BASE_DIR / "bin"
codemg_utils_dir = EXECUTABLES_DIR / "utils"

codebase_path = BASE_DIR / "codebase"
codebase_dist_dir = codebase_path / "dist"

codebase_server_port = 782
codebase_server_url = f"http://localhost:{codebase_server_port}"
codebase_remote_url = "https://github.com/rahulml25/codemanager"

############################     #-#-# Requirements Installation Config #-#-#     ############################
# MongoDB local Server & Tools
mongoInstall_dir = codemg_utils_dir / "mongodb"

mongoServer_displayName = "MongoDB Server"
mongoServerInstaller_path = TEMP_DIR / "mongoserver_installer.msi"
mongoServerUrl = (
    "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.7-signed.msi"
)

mongoShell_displayName = "MongoDB Shell"
mongoShell_presenceCheck_cmd = ["mongosh", "--version"]
mongoShellZIP_path = TEMP_DIR / "mongodb_shell.zip"
mongoShellBIN_path = mongoInstall_dir / "shell"
mongoShellUrl = "https://downloads.mongodb.com/compass/mongosh-2.2.4-win32-x64.zip"

mongoTools_displayName = "MongoDB Tools"
mongoTools_presenceCheck_cmd = ["mongodump", "/version"]
mongoToolsUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.9.4.zip"
mongoToolsZIP_path = TEMP_DIR / "mongodb_tools.zip"
mongoToolsBIN_path = mongoInstall_dir / "tools"

#############################     #-#-# Requirements Installation Config - [END] #-#-#     #############################


# Windows Registry Keys
autoStartup_registryKey_path = r"Software\Microsoft\Windows\CurrentVersion\Run"


#############################     #-#-# CodeManager Installation Config #-#-#     #############################
# CodeManager ZIP config
codemanagerZIP_displayName = "CodeManager Archive"
codemanagerZIP_path = TEMP_DIR / "codemanager.zip"
codemanagerZIP_url = f"{codebase_remote_url}/releases/latest/download/codemanager.zip"

# CodeManager GUI config
codemanagerGUI_exe_name = "GUI-Setup.exe"
codemanagerGUI_setup_init = codemg_utils_dir / codemanagerGUI_exe_name
codemanagerGUI_setup = TEMP_DIR / "gui-setup" / codemanagerGUI_exe_name

# CodeManager Server config
codemgServer_exe_name = "codemg-server.exe"
codemgServer_exe_path = codemg_utils_dir / codemgServer_exe_name

# Python Scripts
python_scripts_dir = codebase_path / "python" / "scripts"

# Build Config: codemg
codemgCLI_exe_name = "codemg.exe"
codemgCLI_exe_path = EXECUTABLES_DIR / codemgCLI_exe_name

# Build Config: codemg-setup
codemgSetup_exe_name = "codemg-setup.exe"
codemgSetup_exe_path = codemg_utils_dir / codemgSetup_exe_name

#############################     #-#-# Codemanager Installation Config - [END] #-#-#     #############################

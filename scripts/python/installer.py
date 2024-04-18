import os, re
import shutil
import subprocess
import lib.config as config
from lib.utils import (
    add_to_path,
    add_to_startup,
    commandOutput,
    downloadFile,
    extract_utilities,
    run_command,
    terminate_process_by_name,
    terminate_server,
)


# # Terminating: codemg-server & [Server + Watcher]
terminate_process_by_name(config.codemgServer_exe_name)
terminate_server(srv_port=config.codebase_server_port)


## ##/##./## Installing: MongoDB local Server, Shell & Tools ##/.##/##

if not config.TEMP_DIR.exists():
    os.makedirs(config.TEMP_DIR)

# Installing: MongoDB local Server & Shell
processOutput = commandOutput(config.mongoShell_presenceCheck_cmd)

if not (
    processOutput
    and re.match(
        r"[0-9]+.[0-9]+.[0-9]+",
        str(processOutput.strip()),
    )
):
    if not config.mongoServerInstaller_path.exists():
        downloadFile(
            config.mongoServerUrl,
            config.mongoServerInstaller_path,
            config.mongoServer_displayName,
        )

    if not config.mongoShellZIP_path.exists():
        downloadFile(
            config.mongoShellUrl,
            config.mongoShellZIP_path,
            config.mongoShell_displayName,
        )

    extract_utilities(
        config.mongoShellZIP_path,
        config.mongoShellBIN_path,
        config.mongoShell_displayName,
    )
    add_to_path(config.mongoShellBIN_path)

    returnCode = run_command([config.mongoServerInstaller_path])
    if returnCode != 0:
        print("Installation Abroaded.")

# Installing: MongoDB Tools
processOutput = commandOutput(config.mongoTools_presenceCheck_cmd)

if not (processOutput and str(processOutput.strip()).startswith("mongodump version: ")):
    if not config.mongoToolsZIP_path.exists():
        downloadFile(
            config.mongoToolsUrl,
            config.mongoToolsZIP_path,
            config.mongoTools_displayName,
        )

    extract_utilities(
        config.mongoToolsZIP_path,
        config.mongoToolsBIN_path,
        name=config.mongoTools_displayName,
    )
    add_to_path(config.mongoToolsBIN_path)


# Installing: CodeManager
downloadFile(
    config.codemanagerZIP_url,
    config.codemanagerZIP_path,
    name=config.codemanagerZIP_displayName,
)
extract_utilities(
    config.codemanagerZIP_path,
    config.BASE_DIR,
    name=config.codemanagerZIP_displayName,
    with_bin=True,
    steps=0,
)

add_to_path(config.EXECUTABLES_DIR)
add_to_startup("CodeManager", f'"{config.codemgServer_exe_path}"')

if not config.codemanagerGUI_setup.parent.exists():
    os.makedirs(config.codemanagerGUI_setup.parent)
shutil.move(config.codemanagerGUI_setup_init, config.codemanagerGUI_setup)

subprocess.Popen([config.codemgServer_exe_path])
run_command([config.codemanagerGUI_setup])

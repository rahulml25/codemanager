import sys, os
import shutil
import lib.config.consumer as config
from lib.utils import add_to_path, run_command


##/## Installing: CodeManager & Tools ##\##

if hasattr(sys, "_MEIPASS"):

    # Create EXECUTABLES_DIR if doesn't exist
    if not config.EXECUTABLES_DIR.exists():
        os.makedirs(config.EXECUTABLES_DIR)

    shutil.move(config.codemgCLI_exe_init_path, config.codemgCLI_exe_path)
    add_to_path(config.EXECUTABLES_DIR)

    run_command([config.codemanagerApp_setup_path])

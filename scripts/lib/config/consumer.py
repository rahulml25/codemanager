import sys
from . import Path, HOME_DIR


BASE_DIR = HOME_DIR / ".codemg"
EXECUTABLES_DIR = BASE_DIR / "bin"
MEIPASS_PATH = Path(sys._MEIPASS) if hasattr(sys, "_MEIPASS") else Path.cwd()  # type: ignore

codebases_data_dir = BASE_DIR / "codebases"
codebases_new_entries_dir = codebases_data_dir / "new_entries"

secrets_path = MEIPASS_PATH / ".env"
signing_key_name = "JWT_SECRET"


############################     #-#-# Windows Config #-#-#     ############################

# Absolute paths (important!)
env_SETX_path = r"C:\Windows\System32\setx.exe"

# Windows Registry Keys
autoStartup_registryKey_path = r"Software\Microsoft\Windows\CurrentVersion\Run"

############################     #-#-# Windows Config - [End] #-#-#     ############################

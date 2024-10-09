import json
from . import Path
from .consumer import codemanagerApp_setup_name, codemgCLI_name, codemgCLI_exe_name


CODEBASE_DIR = Path.cwd()

PYTHON_VENV_SCRIPTS_DIR = CODEBASE_DIR / ".venv/Scripts"
TAURI_DIR = CODEBASE_DIR / "src-tauri"
SCRIPTS_DIR = CODEBASE_DIR / "scripts"

BUILD_DIR = CODEBASE_DIR / "build"
DIST_DIR = CODEBASE_DIR / "dist"

# Executables
python_path = PYTHON_VENV_SCRIPTS_DIR / "python.exe"
pip_path = PYTHON_VENV_SCRIPTS_DIR / "pip.exe"
pyinstaller_path = PYTHON_VENV_SCRIPTS_DIR / "pyinstaller.exe"

secrets_path = BUILD_DIR / ".env"

# Tauri Config
tauri_conf_path = TAURI_DIR / "tauri.conf.json"
tauri_msi_dir = TAURI_DIR / "target/release/bundle/msi"


# Tauri Package Config
with open(tauri_conf_path) as f:
    tauri_conf_package = json.load(f)["package"]

app_name = tauri_conf_package["productName"]
app_version = tauri_conf_package["version"]


#############################     #-#-# CodeManager Build Config #-#-#     #############################

# CodeManager-App config
codemanagerApp_setup_init_path = (
    tauri_msi_dir / f"{app_name}_{app_version}_x64_en-US.msi"
)
codemanagerApp_setup_path = DIST_DIR / codemanagerApp_setup_name

# codemg-CLI config
codemgCLI_source = SCRIPTS_DIR / "codemg_cli.py"
codemgCLI_exe_path = DIST_DIR / codemgCLI_exe_name

# Config: CodeManager-Setup
codemanagerSetup_name = "codemg-setup"
codemanagerSetup_exe_name = f"{codemanagerSetup_name}.exe"
codemanagerSetup_source = SCRIPTS_DIR / "setup.py"
codemanagerSetup_exe_path = DIST_DIR / codemanagerSetup_exe_name

#############################     #-#-# CodeManager Build Config #-#-#     #############################

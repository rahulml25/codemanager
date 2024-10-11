import json
from . import Path


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

secrets_build_path = BUILD_DIR / ".env"

# Tauri Config
tauri_conf_path = TAURI_DIR / "tauri.conf.json"
tauri_release_dir = TAURI_DIR / "target/release"


# Tauri Package Config
with open(tauri_conf_path) as f:
    tauri_conf_data = json.load(f)
    tauri_conf_package = tauri_conf_data["package"]
    tauri_conf_bundle = tauri_conf_data["tauri"]["bundle"]

app_manufacturer = "cloutcoders"
app_name = tauri_conf_package["productName"]
app_version = tauri_conf_package["version"]
app_identifier = tauri_conf_bundle["identifier"]


#############################     #-#-# CodeManager Build Config #-#-#     #############################

# CodeManager-App config
codemanagerApp_exe_name = "codemanager.exe"
codemanagerApp_exe_path = tauri_release_dir / codemanagerApp_exe_name

# codemg-CLI config
codemgCLI_name = "codemg"
codemgCLI_exe_name = f"{codemgCLI_name}.exe"
codemgCLI_source = SCRIPTS_DIR / "codemg_cli.py"
codemgCLI_exe_path = DIST_DIR / codemgCLI_exe_name

# Config: CodeManager-Setup
codemanagerSetup_name = "codemg-setup"
codemanagerSetup_msi_name = f"{codemanagerSetup_name}.msi"
codemanagerSetup_source = CODEBASE_DIR / "wix/codemg-setup.wsx"
codemanagerSetup_msi_path = DIST_DIR / codemanagerSetup_msi_name
codemanagerSCC_sidecar_path = tauri_release_dir / "scc.exe"

#############################     #-#-# CodeManager Build Config #-#-#     #############################

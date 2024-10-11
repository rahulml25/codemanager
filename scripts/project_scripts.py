from typing import Literal
import os, sys, pathlib
import lib.config.codebase as config
from lib.config.consumer import signing_key_name
from lib.utils import run_command, eprint


def build_component(
    name: str,
    command: list[str | pathlib.Path],
    output: Literal["shell", "none"] = "none",
):
    print(f"Generating {name}...", end="", flush=True)
    if run_command(command, output):
        eprint("\nBuild Abroaded.")
        exit(1)
    print("done.")


def build_codemg_setup():
    from dotenv import load_dotenv

    load_dotenv()
    if not config.BUILD_DIR.exists():
        os.makedirs(config.BUILD_DIR)

    # Writing seperate Secrets file for production
    with open(config.secrets_build_path, "w") as file:
        file.write(f'{signing_key_name}="{os.environ.get(signing_key_name)}"')

    # Making: codemg-CLI
    build_component(
        "codemg cli",
        [
            config.pyinstaller_path,
            config.codemgCLI_source,
            "-n",
            config.codemgCLI_name,
            "--onefile",
            "--specpath",
            config.BUILD_DIR,
            #
            # Secrets
            "--add-data",
            f"{config.secrets_build_path}:./",
        ],
    )

    # Making: CodeManager
    build_component("CodeManager", ["bun", "tauri", "build"], "shell")

    # Making: codemg-Setup
    upgradeCode = os.environ.get("UPGRADE_CODE")
    build_component(
        "codemg-setup executable",
        [
            "wix",
            "build",
            config.codemanagerSetup_source,
            "-o",
            config.codemanagerSetup_msi_path,
            #
            # App Info
            "-d",
            f"appName={config.app_name}",
            "-d",
            f"appVersion={config.app_version}",
            "-d",
            f"appManufacturer={config.app_manufacturer}",
            "-d",
            f"appIdentifier={config.app_identifier}",
            "-d",
            f"upgradeCode={upgradeCode}",
            #
            # Components Info
            "-d",
            f"iconPath={config.codemanagerApp_exe_path}",
            "-d",
            f"codemgCLIPath={config.codemgCLI_exe_path}",
            "-d",
            f"codemamagerPath={config.codemanagerApp_exe_path}",
            "-d",
            f"sccSidecarPath={config.codemanagerSCC_sidecar_path}",
        ],
    )


def install_project_dependencies():
    # Python Setup
    run_command(["python", "-m", "venv", ".venv"])
    run_command(
        [
            config.pip_path,
            "install",
            "-r",
            config.SCRIPTS_DIR / "requirements.txt",
        ]
    )

    # Nodejs Setup
    run_command(["bun", "install"])


if __name__ == "__main__" and len(sys.argv) > 1:

    match sys.argv[1]:
        case "fullinstall":
            install_project_dependencies()

        case "build":
            build_codemg_setup()

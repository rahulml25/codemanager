import os, sys, shutil
import lib.config.codebase as config
from lib.config.consumer import signing_key_name
from lib.utils import run_command


def build_codemg_setup():
    from dotenv import load_dotenv

    load_dotenv()
    if not config.BUILD_DIR.exists():
        os.makedirs(config.BUILD_DIR)

    # Writing seperate Secrets file for production
    with open(config.secrets_path, "w") as file:
        file.write(f'{signing_key_name}="{os.environ.get(signing_key_name)}"')

    # Making: codemg-CLI
    run_command(
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
            f"{config.secrets_path}:./",
        ],
        output="none",
    )

    # Making: CodeManager-App
    run_command(["bun", "tauri", "build"])
    shutil.copy2(
        config.codemanagerApp_setup_init_path,
        config.codemanagerApp_setup_path,
    )

    # Making: CodeManager-Setup
    run_command(
        [
            config.pyinstaller_path,
            config.codemanagerSetup_source,
            "-n",
            config.codemanagerSetup_name,
            "--onefile",
            "--specpath",
            config.BUILD_DIR,
            #
            # CLI
            "--add-binary",
            f"{config.codemgCLI_exe_path}:./",
            #
            # App
            "--add-binary",
            f"{config.codemanagerApp_setup_path}:./",
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

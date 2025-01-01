import os
from pathlib import Path
from colorama import Style
from lib.utils import run_command


def create_directory(directory_path: str | Path):
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)


def write_to_file(file_path: str | Path, content: str):
    with open(file_path, "w") as file:
        file.write(content)


def create_python_environment(destination_path: str | Path):
    environment_path = os.path.join(destination_path, ".venv")
    run_command(["python", "-m", "venv", environment_path])


def open_with_code(directory_path: str, reuse_current: bool):
    path = Path(directory_path).resolve()
    if reuse_current:
        run_command(["code", "-r", directory_path])
    else:
        run_command(["code", directory_path])


def reset_terminal_colors():
    print(Style.RESET_ALL + "", end="")

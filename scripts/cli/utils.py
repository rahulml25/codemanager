import os
from colorama import Style


def create_directory(directory_name: str):
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)


def create_python_enviromment(destination_path: str):
    environment_path = os.path.join(destination_path, ".venv")
    os.system(f"python -m venv {environment_path}")


def open_with_code(directory_name: str, reuse_current: bool):
    if reuse_current:
        os.system(f"code -r {directory_name}")
    else:
        os.system(f"code {directory_name}")


def reset_terminal_colors():
    print(Style.RESET_ALL + "", end="")

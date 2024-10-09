import os
import argparse
from typing import get_args
from colorama import Fore, Style
from .config import JS_PACKAGE_MANAGERS, TEMPLATE, PROJECT_TEMPLATES
from .utils import reset_terminal_colors


def get_cli_args():
    parser = argparse.ArgumentParser(
        prog="CodeManager - CLI",
        description="Organizes all coding projects on the device",
    )

    parser.add_argument(
        "--list-templates", action="store_true", help="List all templates"
    )

    subparsers = parser.add_subparsers(dest="command")
    project_creator = subparsers.add_parser("create")

    project_creator.add_argument(
        "project_template",
        metavar="template",
        help="Template to create the project",
        choices=get_args(TEMPLATE),
    )
    project_creator.add_argument(
        "directory", help="Destination directory to create the project"
    )

    project_creator.add_argument(
        "--git",
        help="Initializes git version control system in the project",
        action="store_true",
    )

    project_creator.add_argument(
        "-rc",
        help="Reuses current vscode instance",
        action="store_true",
    )

    project_creator.add_argument(
        "-nc",
        help="Creates project without opening the project in vscode",
        action="store_true",
    )

    project_creator.add_argument(
        "--jpm",
        metavar="JS package manager",
        help="Package manager for JavaScript",
        type=str,
        default="npm",
        choices=JS_PACKAGE_MANAGERS,
    )

    args = parser.parse_args()

    # Printing the list of templates
    if args.list_templates:
        print(Fore.CYAN + Style.BRIGHT + "Template \t  Description")
        reset_terminal_colors()
        [
            print(f"{idx+1}. {template.name} \t- {template.description}")
            for idx, template in enumerate(PROJECT_TEMPLATES.all_templates())
        ]
        os._exit(0)

    return args

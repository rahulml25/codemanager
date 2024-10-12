import os
import argparse
from typing import get_args
from colorama import Fore, Style
from .config import JS_PACKAGE_MANAGERS, TEMPLATE, PROJECT_TEMPLATES
from .utils import reset_terminal_colors


class CustomHelpFormatter(argparse.HelpFormatter):
    def __init__(self, prog):
        super().__init__(prog, max_help_position=40, width=80)

    def _format_action_invocation(self, action):
        if not action.option_strings or action.nargs == 0:
            return super()._format_action_invocation(action)
        default = self._get_default_metavar_for_optional(action)
        args_string = self._format_args(action, default)
        return ", ".join(action.option_strings) + " " + args_string


def get_cli_args():
    fmt = lambda prog: CustomHelpFormatter(prog)
    parser = argparse.ArgumentParser(
        prog="codemg",
        description="CodeManager - CLI: Organizes all coding projects on the device",
        formatter_class=fmt,
    )

    parser.add_argument(
        "-lt",
        "--list-templates",
        action="store_true",
        help="list all templates",
    )

    subparsers = parser.add_subparsers(dest="command")
    project_creator = subparsers.add_parser(
        "create",
        help="create a new project",
        formatter_class=fmt,
    )
    project_adder = subparsers.add_parser(
        "add",
        help="add an existing project",
        formatter_class=fmt,
    )

    # Project Creator arguments
    project_creator.add_argument(
        "project_template",
        metavar="template",
        choices=get_args(TEMPLATE),
        help="template to create the project",
    )
    project_creator.add_argument(
        "directory",
        help="destination directory to create the project",
    )

    project_creator.add_argument(
        "--git",
        help="initializes git version control system in the project",
        action="store_true",
    )
    project_creator.add_argument(
        "-rc",
        help="reuses current vscode instance",
        action="store_true",
    )
    project_creator.add_argument(
        "-nc",
        help="creates project without opening the project in vscode",
        action="store_true",
    )
    project_creator.add_argument(
        "--jpm",
        default="npm",
        choices=JS_PACKAGE_MANAGERS,
        metavar="<package-manager>",
        help="package manager for JavaScript",
    )

    # Project Adder arguments
    project_adder.add_argument(
        "directory",
        help="project directory to add",
    )
    project_adder.add_argument(
        "-t",
        "--template",
        default="normal",
        metavar="<template>",
        choices=get_args(TEMPLATE),
        help="specifies the project template",
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

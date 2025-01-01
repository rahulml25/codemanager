import os, pathlib
from lib.utils import run_command
from cli.args_parser import get_cli_args
from cli.config import PROJECT_TEMPLATES
from cli.utils import open_with_code
from cli.db_functions import create_project_db


args = get_cli_args()

if args.command == "create":
    project_template = PROJECT_TEMPLATES.get_template(args.project_template)

    if project_template is None:
        raise Exception(f"Project type '{args.project_template}' not supported.")

    if os.path.exists(args.directory) and len(os.listdir(args.directory)):
        raise Exception(f"Project directory '{args.directory}' is not empty.")

    # Matching project template
    match project_template.name:

        case "normal":
            project_template.func(
                args.directory,
                **{},
            )

        case "python":
            project_template.func(
                args.directory,
                **{},
            )

        case "python-sep":
            project_template.func(
                args.directory,
                **{},
            )

        case "nodejs":
            project_template.func(
                args.directory,
                **{"js-package-manager": args.jpm},
            )

        case "nodejs-ts":
            project_template.func(
                args.directory,
                **{"js-package-manager": args.jpm},
            )

        case "nextjs":
            project_template.func(
                args.directory,
                **{"js-package-manager": args.jpm},
            )

        case "rust":
            project_template.func(
                args.directory,
                **{},
            )

        case _:
            raise Exception(
                f"Project type '{args.project_template}' not supported yet."
            )

    # Additional functionalities
    if args.git:
        run_command(["git", "init", args.directory])

    if not args.nc:
        open_with_code(args.directory, args.rc)


elif args.command == "add":
    project_template = PROJECT_TEMPLATES.get_template(args.template)

    if project_template is None:
        raise Exception(f"Project type '{args.template}' not supported.")

    if not os.path.exists(args.directory):
        raise Exception(f"Project directory '{args.directory}' doesn't exist.")

    directory_path = pathlib.Path(args.directory).resolve()
    create_project_db(
        directory_path.name,
        os.path.abspath(directory_path),
        args.template,
    )

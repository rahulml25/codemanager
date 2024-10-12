import json, os
from pathlib import Path
from lib.utils import run_command
from .config import JS_PACKAGE_MANAGERS
from .db_functions import create_project_db
from .utils import (
    create_directory,
    create_python_enviromment,
    write_to_file,
)


def create_normal_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()

    create_directory(directory_path)
    create_project_db(directory_path.name, os.path.abspath(directory_path), "normal")


def create_python_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()

    create_directory(directory_path)

    script_path = os.path.join(directory_path, "main.py")
    write_to_file(script_path, 'print("Hello World!")')

    create_project_db(directory_path.name, os.path.abspath(directory_path), "python")


def create_seperate_python_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()

    create_directory(directory_path)
    create_python_enviromment(directory_path)

    script_path = os.path.join(directory_path, "main.py")
    write_to_file(script_path, 'print("Hello World!")')

    create_project_db(
        directory_path.name,
        os.path.abspath(directory_path),
        "python_sep",
    )


def create_nodejs_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()
    js_pm_name = str(options.get("js-package-manager"))
    js_pm = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")

    create_directory(directory_path)
    script_path = os.path.join(directory_path, "index.js")

    run_command([js_pm.name, "init", "-y", directory_path])

    if js_pm.name != "bun":
        write_to_file(script_path, 'console.log("Hello World")')

    create_project_db(directory_path.name, os.path.abspath(directory_path), "nodejs")


def create_nodejsTS_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()
    js_pm_name = str(options.get("js-package-manager"))
    js_pm_enum = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm_enum is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")
    js_pm = js_pm_enum.value

    create_directory(directory_path)

    script_name = "index.ts"
    script_path = os.path.join(directory_path, script_name)

    run_command(
        [
            *["cd", directory_path],
            *["&&", js_pm.package_manager, "init", "-y"],
        ]
    )

    if js_pm.package_manager != "bun":
        jsonfile_path = os.path.join(directory_path, "package.json")
        with open(jsonfile_path, "r") as file:
            json_data = json.load(file)

        json_data["scripts"] = {
            "dev": f"{js_pm.package_executor} ts-node {script_name}"
        }
        write_to_file(jsonfile_path, json.dumps(json_data, indent=2))

        run_command(
            [
                *["cd", directory_path],
                *["&&", *js_pm.dev_install_cmd, "@types/node", "typescript", "ts-node"],
                *["&&", js_pm.package_executor, "tsc", "--init"],
            ]
        )

        write_to_file(script_path, 'console.log("Hello World")')

    create_project_db(directory_path.name, os.path.abspath(directory_path), "nodejs-ts")


def create_nextjs_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()
    js_pm_name = str(options.get("js-package-manager"))
    js_pm = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")

    run_command([js_pm.name, "create", "next-app@latest", directory_path])

    create_project_db(directory_path.name, os.path.abspath(directory_path), "nextjs")


def create_rust_project(_directory_path: str, **options: str):
    directory_path = Path(_directory_path).resolve()
    run_command(["cargo", "new", directory_path])
    create_project_db(directory_path.name, os.path.abspath(directory_path), "rust")

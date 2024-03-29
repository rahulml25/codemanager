import json, os
from config import JS_PACKAGE_MANAGERS
from scripts.cli.db_functions import create_project_db
from utils import create_directory, create_python_enviromment
import subprocess


def create_normal_project(directory_name: str, **options: str):
    create_directory(directory_name)
    create_project_db(directory_name, os.path.abspath(directory_name), "normal")


def create_python_project(directory_name: str, **options: str):

    create_directory(directory_name)

    script_path = os.path.join(directory_name, "main.py")
    os.system(f'echo print("Hello World!") > {script_path}')

    create_project_db(directory_name, os.path.abspath(directory_name), "python")


def create_seperate_python_project(directory_name: str, **options: str):

    create_directory(directory_name)
    create_python_enviromment(directory_name)

    script_path = os.path.join(directory_name, "main.py")
    os.system(f'echo print("Hello World!") > {script_path}')

    create_project_db(directory_name, os.path.abspath(directory_name), "python_sep")


def create_nodejs_project(directory_name: str, **options: str):
    js_pm_name = str(options.get("js-package-manager"))
    js_pm = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")

    create_directory(directory_name)
    script_path = os.path.join(directory_name, "index.js")

    os.system(f"{js_pm.name} init -y {directory_name}")

    if js_pm.name != "bun":
        os.system(f'echo console.log("Hello World") > {script_path}')

    create_project_db(directory_name, os.path.abspath(directory_name), "nodejs")


def create_nodejsTS_project(directory_name: str, **options: str):
    js_pm_name = str(options.get("js-package-manager"))
    js_pm_enum = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm_enum is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")
    js_pm = js_pm_enum.value

    create_directory(directory_name)

    script_name = "index.ts"
    script_path = os.path.join(directory_name, script_name)

    process = subprocess.Popen(
        f"""cd {directory_name} && {js_pm.package_manager} init -y""",
        shell=True,
    )
    process.wait()

    if js_pm.package_manager != "bun":
        jsonfile_path = os.path.join(directory_name, "package.json")
        with open(jsonfile_path, "r") as file:
            json_data = json.load(file)

        with open(jsonfile_path, "w") as file:
            json_data["scripts"] = {
                "dev": f"{js_pm.package_executor} ts-node {script_name}"
            }
            json.dump(json_data, file, indent=2)

        os.system(
            f"""cd {directory_name} && {js_pm.dev_install_cmd} @types/node typescript ts-node && {js_pm.package_executor} tsc --init"""
        )

        os.system(f'echo console.log("Hello World") > {script_path}')

    create_project_db(directory_name, os.path.abspath(directory_name), "nodejs-ts")


def create_nextjs_project(directory_name: str, **options: str):
    js_pm_name = str(options.get("js-package-manager"))
    js_pm = JS_PACKAGE_MANAGERS.get(js_pm_name)

    if js_pm is None:
        raise Exception(f"JavaScript package manager '{js_pm_name}' not supportd.")

    os.system(f"{js_pm.name} create next-app@latest {directory_name}")

    create_project_db(directory_name, os.path.abspath(directory_name), "nextjs")


def create_rust_project(directory_name: str, **options: str):
    os.system(f"cargo new {directory_name}")
    create_project_db(directory_name, os.path.abspath(directory_name), "rust")

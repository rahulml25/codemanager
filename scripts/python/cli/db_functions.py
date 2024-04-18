from config import TEMPLATE
import requests

import pathlib
from importlib import util


def get_module(name: str, module_path: str | bytes | pathlib.Path):
    spec = util.spec_from_file_location(name, str(module_path))

    if spec is not None:
        module = util.module_from_spec(spec)
        if spec.loader is not None:
            spec.loader.exec_module(module)

    return module


def create_project_db(
    name: str,
    path: str,
    template: TEMPLATE,
    description: str = "",
):
    port = 782
    try:
        module = get_module("lib.config", pathlib.Path(__file__).parent.parent / "lib" / "config.py")
        port = module.codebase_server_port
    except:
        pass

    project_data = {
        "name": name,
        "template": template,
        "path": path,
        "description": description,
    }
    try:
        _ = requests.post(f"http://localhost:{port}/projects", json=project_data)
    except:
        print("CodeManager server not running.")

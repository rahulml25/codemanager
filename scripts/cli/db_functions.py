from config import TEMPLATE
import requests


def create_project_db(
    name: str,
    path: str,
    template: TEMPLATE,
    description: str = "",
):
    project_data = {
        "name": name,
        "template": template,
        "path": path,
        "description": description,
    }
    _ = requests.post("http://localhost:782/api/projects", json=project_data)

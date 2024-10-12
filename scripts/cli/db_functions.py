from datetime import datetime, timezone
from .config import TEMPLATE
from .custom_classes import NewProject
from lib.config.consumer import (
    secrets_path,
    signing_key_name,
    codebases_new_entries_dir,
)


import jwt
import uuid
from dotenv import dotenv_values


new_projects_dir = codebases_new_entries_dir
secrets = dotenv_values(secrets_path)


def generate_adder_id():
    adder_uuid = uuid.uuid4()
    adder_spawn_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
    adder_id = f"{adder_uuid}_<a:r:i:d>_{adder_spawn_time}"
    return adder_id


def create_project_db(
    name: str,
    path: str,
    template: TEMPLATE,
):

    try:
        adder_id = generate_adder_id()
        new_project = NewProject(name, template, path, adder_id)
        project_data = new_project.json()

        # saving 'new_project' to codebases_new_entries_dir
        new_entry_id = uuid.uuid4()
        filepath = new_projects_dir / f"{new_entry_id}.cb"

        with open(filepath, "w") as f:
            encoded_jwt = jwt.encode(
                project_data,
                secrets[signing_key_name],
                algorithm="HS256",
            )
            f.write(encoded_jwt)

    except:
        print("CodeManager: Failed to write project data.")

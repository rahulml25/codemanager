import os, pathlib

codebase_server_path = pathlib.Path.home() / ".codemg" / "codebase" / "server"

if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(f"cd {str(codebase_server_path)} && npm i && npm run build")

os.system(f"cd {str(codebase_server_path)} && npm run start")

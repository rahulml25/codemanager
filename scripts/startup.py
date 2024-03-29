import os, pathlib

codebase_path = pathlib.Path.home() / ".codemg" / "codebase"
codebase_server_path = codebase_path / "server"

os.system(f"cd {codebase_path} && git pull")

if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(f"cd {str(codebase_server_path)} && npm i && npm run build")

os.system(f"cd {str(codebase_server_path)} && npm run start")

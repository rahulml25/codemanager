import os, pathlib

codebase_path = pathlib.Path.home() / ".codemg" / "codebase"
codebase_server_path = codebase_path / "server"

# Executables
nodeNPM_path = r'"C:\Program Files\nodejs\npm"'
git_path = r'"C:\Program Files\Git\cmd\git"'

os.system(f"cd {codebase_path} && {git_path} pull")

if not os.path.exists(codebase_server_path / ".next" / "BUILD_ID"):
    os.system(
        f"cd {codebase_server_path} && {nodeNPM_path} i && {nodeNPM_path} run build"
    )

os.system(f"cd {codebase_server_path} && {nodeNPM_path} run start")

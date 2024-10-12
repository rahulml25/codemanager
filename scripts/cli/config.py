import platform
from enum import Enum
from typing import Literal, Union
from .custom_classes import JS_PACKAGE_MANAGER


OPERATING_SYSTEM = platform.system()


class JS_PACKAGE_MANAGERS(Enum):
    npm = JS_PACKAGE_MANAGER(
        package_manager="npm",
        package_executor="npx",
        install_cmd=["npm", "i"],
        dev_install_cmd=["npm", "i", "-D"],
        install_all_cmd=["npm", "i"],
    )
    yarn = JS_PACKAGE_MANAGER(
        package_manager="yarn",
        package_executor="yarn",
        install_cmd=["yarn", "add"],
        dev_install_cmd=["yarn", "add", "-D"],
        install_all_cmd=["yarn"],
    )
    pnpm = JS_PACKAGE_MANAGER(
        package_manager="pnpm",
        package_executor="pnpx",
        install_cmd=["pnpm", "i"],
        dev_install_cmd=["pnpm", "i", "-D"],
        install_all_cmd=["pnpm", "i"],
    )

    if OPERATING_SYSTEM in ("Linux", "Darwin"):
        bun = JS_PACKAGE_MANAGER(
            package_manager="bun",
            package_executor="bunx",
            install_cmd=["bun", "install"],
            dev_install_cmd=["bun", "install", "-D"],
            install_all_cmd=["bun", "install"],
        )

    @staticmethod
    def names():
        return list(map(lambda x: x.name, JS_PACKAGE_MANAGERS))

    @staticmethod
    def values():
        return list(map(lambda x: x.value, JS_PACKAGE_MANAGERS))

    @staticmethod
    def items():
        return list(map(lambda x: (x.name, x.value), JS_PACKAGE_MANAGERS))

    @staticmethod
    def get(key: str) -> Union["JS_PACKAGE_MANAGERS", None]:
        if key in JS_PACKAGE_MANAGERS.names():
            return JS_PACKAGE_MANAGERS[key]
        return None


TEMPLATE = Literal[
    "normal", "python", "python_sep", "nodejs", "nodejs-ts", "nextjs", "rust"
]

from .custom_classes import JS_PACKAGE_MANAGER, TemplateInit, Templates
from .project_builders import (
    create_nextjs_project,
    create_nodejs_project,
    create_nodejsTS_project,
    create_normal_project,
    create_python_project,
    create_rust_project,
    create_seperate_python_project,
)

PROJECT_TEMPLATES = Templates[TEMPLATE](
    {
        "normal": TemplateInit(
            func=create_normal_project,
            description="Creates a normal project",
        ),
        "python": TemplateInit(
            func=create_python_project,
            description="Creates a Python project",
        ),
        "python_sep": TemplateInit(
            func=create_seperate_python_project,
            description="Creates a Python project with .env",
        ),
        "nodejs": TemplateInit(
            func=create_nodejs_project,
            description="Creates a Node.js project",
        ),
        "nodejs-ts": TemplateInit(
            func=create_nodejsTS_project,
            description="Creates a Node.js project with Typescript",
        ),
        "nextjs": TemplateInit(
            func=create_nextjs_project,
            description="Creates a Next.js project",
        ),
        "rust": TemplateInit(
            func=create_rust_project,
            description="Creates a Rust project",
        ),
    }
)

from dataclasses import dataclass, asdict
from typing import Callable, TypedDict


@dataclass
class Template[TEMPLATE]:
    name: TEMPLATE
    func: Callable[[str], None]
    description: str


@dataclass
class TemplateInit(TypedDict):
    func: Callable[[str], None]
    description: str


class Templates[TEMPLATE]:
    __templates: dict[TEMPLATE, Template]

    def __init__(self, templates: dict[TEMPLATE, TemplateInit]) -> None:
        self.__templates = {}

        for name, template in templates.items():
            self.__templates[name] = Template(name, **template)

    def get_template(self, template_name: TEMPLATE) -> Template[TEMPLATE]:
        return self.__templates[template_name]

    def all_templates(self) -> list[Template[TEMPLATE]]:
        return list(self.__templates.values())


@dataclass
class JS_PACKAGE_MANAGER:
    package_manager: str
    package_executor: str
    install_cmd: str
    dev_install_cmd: str
    install_all_cmd: str


@dataclass
class NewProject:
    name: str
    template: str
    path: str

    # Extra info(s)
    adder_id: str
    exp: int = 0

    def json(self):
        return asdict(self)

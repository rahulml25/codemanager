type Project = {
  _id: string;
  name: string;
  template: TemplateKey;
  path: string;
  description: string;
  _createdAt: string;
};

type DBConnector = {
  dbClient: import("mongodb").MongoClient;
  isOnline: boolean;
};

type TemplateKey =
  | "normal"
  | "python"
  | "python_sep"
  | "nodejs"
  | "nodejs-ts"
  | "nextjs"
  | "rust";

interface iconProps extends React.SVGProps<SVGElement> {
  size?: number | string;
}

type Option = {
  name: string;
  displayName?: string;
  icon?: React.FunctionComponent<iconProps>;
  icon?: React.FunctionComponent<iconProps>;
};

interface iconProps extends React.SVGProps<SVGElement> {
  size?: number | string;
}

type Option = {
  name: string;
  displayName?: string;
  icon?: React.FunctionComponent<iconProps>;
  icon?: React.FunctionComponent<iconProps>;
};

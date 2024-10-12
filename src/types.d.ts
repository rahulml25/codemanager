interface iconProps extends React.SVGProps<SVGElement> {
  size?: number | string;
}

type Option = {
  name: string;
  displayName?: string;
  icon?: React.FunctionComponent<iconProps>;
  icon?: React.FunctionComponent<iconProps>;
};

type AppResponse<T, S> =
  | {
      data: T;
      success: true;
    }
  | {
      data: S;
      success: false;
    };

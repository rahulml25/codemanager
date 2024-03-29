export const parsable = <T>(data: T): T => JSON.parse(JSON.stringify(data));
export const classNames = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export const parsable = <T>(data: T): T => JSON.parse(JSON.stringify(data));
export const classNames = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");
export const time = (time_string: string) => new Date(time_string).getTime();
export const wait = async (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

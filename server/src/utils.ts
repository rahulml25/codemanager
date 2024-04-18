import { type RequestHandler } from "express";

export const bodyCollector: RequestHandler = (req, _res, next) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk.toString();
  });
  req.on("end", () => {
    req.body = data;
    next();
  });
};

export function jsonSafeParse(body: string) {
  try {
    if (!body) return null;
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

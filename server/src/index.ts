import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { bodyCollector, jsonSafeParse } from "./utils";
import { isOnline } from "../../tslib/utils";
import {
  projectCreateSchema,
  projectUpdateSchema,
  type ProjectWithoutId,
  type ProjectFieldsOnly,
} from "../../tslib/schema";
import { server_PORT } from "../../tslib/config";
import { mainClient, getAvailableClient, watchDatabase } from "./database";

watchDatabase().catch(console.error);

const app = express();
const port = server_PORT;

app.use(bodyCollector);
app.use(cors());

// GET - All Projects
app.get("/projects", async (_req, res) => {
  const db = (await getAvailableClient()).db("codemanager");
  const collection = db.collection<ProjectWithoutId>("projects");

  const projects = await collection.find().toArray();
  return res.json({ success: true, data: projects });
});

// CREATE - A Project
app.post("/project", async (req, res) => {
  if (!(await isOnline())) {
    return res
      .status(417)
      .json({ success: false, error: "codemanager is offline" });
  }

  const body = jsonSafeParse(req.body);

  if (!body) {
    return res.status(400).send({ error: "invalid request" });
  }

  const parsedBody = projectCreateSchema.safeParse(body);
  if (!parsedBody.success) {
    return res.status(400).json({ success: false, error: "invalid content" });
  }

  const db = mainClient.db("codemanager");
  const collection = db.collection<ProjectWithoutId>("projects");

  const data = {
    ...parsedBody.data,
    _createdAt: new Date(Date.now()).toString(),
  };

  const alreadyExists = await collection.findOne(
    { path: data.path },
    { projection: { _id: 1 } }
  );
  if (alreadyExists) {
    return res.status(400).json({ success: false, error: "duplicate path" });
  }

  const creationRes = await collection.insertOne(data);
  const projectId = creationRes.insertedId;

  return res.json({
    success: true,
    data: { ...data, _id: projectId.toHexString() },
  });
});

// UPDATE - A Project Fields
app.patch("/project", async (req, res) => {
  if (!(await isOnline())) {
    return res
      .status(417)
      .json({ success: false, error: "codemanager is offline" });
  }

  const body = jsonSafeParse(req.body);

  if (!body) {
    return res.status(400).send({ error: "invalid request" });
  }

  const parsedBody = projectUpdateSchema.safeParse(body);
  if (!parsedBody.success || Object.keys(parsedBody.data).length < 2) {
    return res.status(400).json({ success: false, error: "invalid content" });
  }

  const db = mainClient.db("codemanager");
  const collection = db.collection<ProjectWithoutId>("projects");

  const data = { ...parsedBody.data } as ProjectFieldsOnly;
  delete (data as any)._id; // This is necessary to omit '_id' field

  const updatedProject = await collection.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(parsedBody.data._id) },
    { $set: data },
    { returnDocument: "after" }
  );
  if (!updatedProject) {
    return res
      .status(404)
      .json({ success: false, error: "project doesn't exists" });
  }

  res.json({ success: true, data: updatedProject });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

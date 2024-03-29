import z from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getDBConnector, getProjectsCol } from "@/lib/db";

let dbConnectior: DBConnector;

async function getCollection() {
  dbConnectior = await getDBConnector();
  const collection = getProjectsCol(dbConnectior.dbClient);
  return collection;
}

type FetchResponseData = {
  success: boolean;
  data: Project[];
};

export async function GET(
  _req: NextRequest
): Promise<NextResponse<FetchResponseData>> {
  const projectsCol = await getCollection();
  const projectsCursor = projectsCol.find();
  const projects = (await projectsCursor.toArray()) as unknown as Project[];

  return NextResponse.json({ success: true, data: projects });
}

const projectRef = z.object({
  name: z.string().trim().min(1),
  template: z.string().trim().min(1),
  path: z.string().trim().min(1),
  description: z.string().optional().default(""),
});

type CreateResponseData =
  | {
      success: true;
      data: Project;
    }
  | {
      success: false;
      error: string;
    };

export async function POST(
  req: NextRequest
): Promise<NextResponse<CreateResponseData>> {
  let success = true;

  const req_json = await req.json();
  const parsed_result = projectRef.safeParse(req_json);

  if (!parsed_result.success) {
    success = false;
    return NextResponse.json(
      { success, error: "invalid request" },
      { status: 400 }
    );
  }

  const data = {
    ...parsed_result.data,
    _createdAt: new Date(Date.now()).toISOString(),
  };

  const projectsCol = await getCollection();
  if (!dbConnectior.isOnline) {
    success = false;
    return NextResponse.json(
      { success, error: "codemanager is offline" },
      { status: 417 }
    );
  }

  const creationRes = await projectsCol.insertOne(data);
  const projectId = creationRes.insertedId;

  return NextResponse.json({
    success,
    data: { ...data, _id: projectId.toHexString() } as Project,
  });
}

import type { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  console.log(req);
  return Response.json({ lol: req.ip });
};

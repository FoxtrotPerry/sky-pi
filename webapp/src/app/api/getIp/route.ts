import type { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  return Response.json({ lol: req.ip });
};

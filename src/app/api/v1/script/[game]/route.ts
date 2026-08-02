import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { game: string } }
) {
  const game = params.game.toLowerCase();
  const validGames = ["loader", "mm2", "pressure", "demonology"];

  if (!validGames.includes(game)) {
    return new NextResponse("Script not found", { status: 404 });
  }

  try {
    const filename = game === "loader" ? "loader.lua" : `${game}.lua`;
    const filePath = path.join(process.cwd(), "public", "scripts", filename);

    if (!fs.existsSync(filePath)) {
      // Fallback for loader at root of public
      const altPath = path.join(process.cwd(), "public", filename);
      if (fs.existsSync(altPath)) {
        const content = fs.readFileSync(altPath, "utf-8");
        return new NextResponse(content, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
      return new NextResponse("Script file missing", { status: 404 });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PMTiles } from "pmtiles";
import { readFile } from "fs/promises";
import path from "path";

let pmtilesInstance: PMTiles | null = null;

/** Lazily create a PMTiles reader backed by a file buffer. */
async function getPMTiles(): Promise<PMTiles> {
  if (pmtilesInstance) return pmtilesInstance;

  const filePath = path.join(process.cwd(), "public", "data", "milwaukee-parcels.pmtiles");
  const buffer = await readFile(filePath);
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  // PMTiles expects a source with getBytes; create a simple in-memory source
  const source = {
    getKey: () => "parcels",
    getBytes: async (offset: number, length: number) => {
      return {
        data: arrayBuffer.slice(offset, offset + length),
      };
    },
  };

  pmtilesInstance = new PMTiles(source);
  return pmtilesInstance;
}

/**
 * Serves vector tiles from the PMTiles file.
 * URL: /api/tiles?z=12&x=1024&y=1500
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const z = parseInt(searchParams.get("z") ?? "");
  const x = parseInt(searchParams.get("x") ?? "");
  const y = parseInt(searchParams.get("y") ?? "");

  if (isNaN(z) || isNaN(x) || isNaN(y)) {
    return NextResponse.json({ error: "Missing z, x, y params" }, { status: 400 });
  }

  try {
    const pmtiles = await getPMTiles();
    const tile = await pmtiles.getZxy(z, x, y);

    if (!tile || !tile.data || tile.data.byteLength === 0) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(tile.data, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.mapbox-vector-tile",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

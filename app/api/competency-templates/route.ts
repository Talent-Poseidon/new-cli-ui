import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await prisma.competencyTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("[API] GET /api/competency-templates failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch competency templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, fileName, fileUrl } = body;

    if (!name || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const template = await prisma.competencyTemplate.create({
      data: { name, fileName, fileUrl },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/competency-templates failed:", error);
    return NextResponse.json(
      { error: "Failed to create competency template" },
      { status: 500 }
    );
  }
}

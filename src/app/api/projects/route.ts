import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createProjectSchema,
  generateProjectKey,
} from "@/lib/validations/project";

import type { NextRequest } from "next/server";

export const GET = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true, members: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = memberships.map((m) => m.project);

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const baseKey = generateProjectKey(parsed.data.name);
    const existingKeys = await prisma.project.findMany({
      where: { key: { startsWith: baseKey } },
      select: { key: true },
    });
    const keySet = new Set(existingKeys.map((p) => p.key));
    let key = baseKey;
    let suffix = 2;
    while (keySet.has(key)) {
      key = `${baseKey}${suffix}`;
      suffix += 1;
    }

    const ownerId = session.user.id;

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          key,
          ownerId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: created.id,
          userId: ownerId,
          role: "OWNER",
        },
      });

      return created;
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};

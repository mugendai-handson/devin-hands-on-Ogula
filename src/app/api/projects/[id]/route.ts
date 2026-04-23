import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validations/project";

import type { NextRequest } from "next/server";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
        },
        { status: 404 },
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "このプロジェクトへのアクセス権がありません",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
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

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
        },
        { status: 404 },
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "プロジェクトを更新する権限がありません",
          },
        },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(body);

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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description,
        }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
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

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
        },
        { status: 404 },
      );
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "プロジェクトを削除できるのはオーナーのみです",
          },
        },
        { status: 403 },
      );
    }

    await prisma.project.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
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

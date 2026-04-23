import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です").max(100, "プロジェクト名は100文字以内で入力してください"),
  description: z.string().max(2000, "説明は2000文字以内で入力してください").optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "プロジェクト名は必須です")
      .max(100, "プロジェクト名は100文字以内で入力してください")
      .optional(),
    description: z
      .string()
      .max(2000, "説明は2000文字以内で入力してください")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "更新するフィールドを指定してください",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * プロジェクト名からプロジェクトキーを生成する。
 * 英単語の頭文字を連結して大文字化する（例: "Devin Task Board" -> "DTB"）。
 * 英字が含まれない場合は名前を大文字化した先頭文字から生成する。
 * 最低 2 文字、最大 5 文字に整形する。
 */
export const generateProjectKey = (name: string): string => {
  const words = name
    .trim()
    .split(/[\s\-_/]+/u)
    .filter(Boolean);

  const initials = words
    .map((w) => {
      const ascii = w.match(/[A-Za-z0-9]/u);
      return ascii ? ascii[0].toUpperCase() : "";
    })
    .filter(Boolean)
    .join("");

  const fallback = name.replace(/[^A-Za-z0-9]/gu, "").toUpperCase();
  const base = initials || fallback || "PRJ";

  if (base.length >= 2) return base.slice(0, 5);
  return (base + "PRJ").slice(0, 3);
};

# ER 図（Entity Relationship Diagram）

> Prisma スキーマ (`prisma/schema.prisma`) に基づく全 11 テーブルの ER 図

```mermaid
erDiagram
    %% ──────────────────────────────────────
    %% テーブル定義
    %% ──────────────────────────────────────

    users {
        String id PK "cuid()"
        String email UK "unique"
        String name
        String password
        String avatarUrl "nullable"
        UserRole role "default: MEMBER"
        String locale "default: ja"
        Theme theme "default: SYSTEM"
        DateTime createdAt
        DateTime updatedAt
    }

    projects {
        String id PK "cuid()"
        String name
        String description "nullable"
        String key
        String ownerId FK "-> users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    project_members {
        String id PK "cuid()"
        String projectId FK "-> projects.id"
        String userId FK "-> users.id"
        ProjectMemberRole role "default: MEMBER"
        DateTime createdAt
        DateTime updatedAt
    }

    tasks {
        String id PK "cuid()"
        Int taskNumber "unique per project"
        String title
        String description "nullable"
        TaskStatus status "default: BACKLOG"
        TaskPriority priority "default: NONE"
        String projectId FK "-> projects.id"
        String assigneeId FK "-> users.id, nullable"
        String reporterId FK "-> users.id"
        String parentTaskId FK "-> tasks.id, nullable"
        DateTime dueDate "nullable"
        DateTime startDate "nullable"
        Float estimatedHours "nullable"
        Float actualHours "nullable"
        Int sortOrder "default: 0"
        DateTime createdAt
        DateTime updatedAt
    }

    categories {
        String id PK "cuid()"
        String name
        String color
        String projectId FK "-> projects.id"
    }

    task_categories {
        String taskId PK_FK "-> tasks.id"
        String categoryId PK_FK "-> categories.id"
    }

    comments {
        String id PK "cuid()"
        String content
        String taskId FK "-> tasks.id"
        String authorId FK "-> users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    attachments {
        String id PK "cuid()"
        String fileName
        String fileUrl
        Int fileSize
        String mimeType
        String taskId FK "-> tasks.id"
        String uploaderId FK "-> users.id"
        DateTime createdAt
    }

    activity_logs {
        String id PK "cuid()"
        ActivityAction action
        String entityType
        String entityId
        String userId FK "-> users.id"
        String projectId FK "-> projects.id"
        Json oldValue "nullable"
        Json newValue "nullable"
        DateTime createdAt
    }

    notifications {
        String id PK "cuid()"
        NotificationType type
        String title
        String message
        Boolean isRead "default: false"
        String userId FK "-> users.id"
        String linkUrl "nullable"
        DateTime createdAt
    }

    audit_logs {
        String id PK "cuid()"
        String action
        String userId FK "-> users.id"
        String ipAddress "nullable"
        String userAgent "nullable"
        String resource
        String resourceId
        Json details "nullable"
        DateTime createdAt
    }

    %% ──────────────────────────────────────
    %% リレーション
    %% ──────────────────────────────────────

    %% User 起点
    users ||--o{ projects : "owns"
    users ||--o{ project_members : "belongs to"
    users ||--o{ tasks : "reports"
    users |o--o{ tasks : "assigned to"
    users ||--o{ comments : "writes"
    users ||--o{ attachments : "uploads"
    users ||--o{ activity_logs : "performs"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "triggers"

    %% Project 起点
    projects ||--o{ project_members : "has"
    projects ||--o{ tasks : "contains"
    projects ||--o{ categories : "defines"
    projects ||--o{ activity_logs : "logged in"

    %% Task 起点
    tasks ||--o{ task_categories : "tagged with"
    tasks ||--o{ comments : "has"
    tasks ||--o{ attachments : "has"
    tasks |o--o{ tasks : "parent / sub"

    %% Category 起点
    categories ||--o{ task_categories : "applied to"
```

## Enum 定義

| Enum | 値 |
|------|-----|
| **UserRole** | `ADMIN` \| `MEMBER` |
| **Theme** | `LIGHT` \| `DARK` \| `SYSTEM` |
| **ProjectMemberRole** | `OWNER` \| `ADMIN` \| `MEMBER` \| `VIEWER` |
| **TaskStatus** | `BACKLOG` \| `TODO` \| `IN_PROGRESS` \| `IN_REVIEW` \| `DONE` |
| **TaskPriority** | `URGENT` \| `HIGH` \| `MEDIUM` \| `LOW` \| `NONE` |
| **ActivityAction** | `CREATED` \| `UPDATED` \| `DELETED` \| `STATUS_CHANGED` \| `ASSIGNED` \| `COMMENTED` \| `ATTACHED` |
| **NotificationType** | `TASK_ASSIGNED` \| `TASK_COMMENTED` \| `TASK_STATUS_CHANGED` \| `TASK_DUE_SOON` \| `MENTIONED` |

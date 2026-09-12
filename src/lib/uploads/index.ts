import { acquirePrismaClient } from "@/lib/infra";

export interface UploadRecord {
  id: string;
  pathname: string;
  uploadName: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

type UploadDelegate = {
  create(args: {
    data: {
      id: string;
      pathname: string;
      uploadName: string;
      userId: string;
      status: string;
    };
  }): Promise<UploadRecord>;
  findUnique(args: { where: { id: string } }): Promise<UploadRecord | null>;
  update(args: {
    where: { id: string };
    data: { status: string };
  }): Promise<UploadRecord>;
};

function uploadDelegate(): UploadDelegate {
  const db = acquirePrismaClient() as unknown as { upload: UploadDelegate };
  return db.upload;
}

export const UploadStatus = {
  Pending: "pending",
  Completed: "completed",
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

export async function createUploadRecord(input: {
  id: string;
  pathname: string;
  uploadName: string;
  userId: string;
  status?: UploadStatus;
}): Promise<UploadRecord> {
  return uploadDelegate().create({
    data: {
      id: input.id,
      pathname: input.pathname,
      uploadName: input.uploadName,
      userId: input.userId,
      status: input.status ?? UploadStatus.Pending,
    },
  });
}

export async function getUploadRecordById(
  id: string,
): Promise<UploadRecord | null> {
  return uploadDelegate().findUnique({
    where: { id },
  });
}

export async function markUploadRecordCompleted(
  id: string,
): Promise<UploadRecord> {
  return uploadDelegate().update({
    where: { id },
    data: { status: UploadStatus.Completed },
  });
}

import { Group, Organization, PrismaClient, User, Workspace } from "@prisma/client";

export type WorkspaceData = {
  ownerId: number,
  ownerType: string,
  title: string,
  description: string
}

export type WorkspaceParams = {
  ownerId?: number,
  ownerType?: string,
  title?: string,
  id?: number
}

type WorkspaceQueryResult = {
  workspace?: Workspace,
  error: boolean,
  exists: boolean
}

function initWorkspaceQueryResult() : WorkspaceQueryResult {
  return {
    error: false,
    exists: false
  }
}

export async function createWorkspace(prisma:PrismaClient, data:WorkspaceData) : Promise<WorkspaceQueryResult> {
  return initWorkspaceQueryResult();
}

export async function readWorkspace(prisma:PrismaClient, params:WorkspaceParams) : Promise<WorkspaceQueryResult> {
  return initWorkspaceQueryResult();
}

export async function updateWorkspace(prisma:PrismaClient, data:WorkspaceData) : Promise<WorkspaceQueryResult> {
  return initWorkspaceQueryResult();
}

export async function deleteWorkspace(prisma:PrismaClient, workspaceId:number) : Promise<boolean> {
  return false;
}
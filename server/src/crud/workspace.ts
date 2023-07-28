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
  };
}

export async function createWorkspace(prisma:PrismaClient, data:WorkspaceData) : Promise<WorkspaceQueryResult> {
  const workspaceQueryResult = initWorkspaceQueryResult();
  
  const { ownerId, ownerType, title, description } = data;
  let owner:User|Group|Organization|null = null;

  switch(ownerType) {
  case 'User': 
    owner = await prisma.user.findFirst({ where: { id: ownerId }});
    break;
  case 'Group': 
    owner = await prisma.group.findFirst({ where: { id: ownerId }});
    break;
  case 'Organization':
    owner = await prisma.organization.findFirst({ where: { id: ownerId }});
    break;
  }

  if (owner === undefined) {
    workspaceQueryResult.error = true;
    return workspaceQueryResult;
  }
  
  try {
    const workspace = await prisma.workspace.create({
      data: {
        orgOwnerId: ownerType === 'Organization' ? ownerId : undefined,
        groupOwnerId: ownerType === 'Group' ? ownerId : undefined,
        userOwnerId: ownerType === 'User' ? ownerId : undefined,
        title,
        description
      }
    });
    if (workspace)
      workspaceQueryResult.workspace = workspace;
  } catch (e) {
    console.error((e as Error).message);
    workspaceQueryResult.exists = true;
  }

  return workspaceQueryResult;
}

export async function readWorkspace(prisma:PrismaClient, params:WorkspaceParams) : Promise<WorkspaceQueryResult> {
  const { ownerId, ownerType, title, id } = params;
  const readWorkspaceResult = initWorkspaceQueryResult();

  if (ownerType) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        orgOwnerId: ownerType === 'Organization' ? ownerId : undefined,
        groupOwnerId: ownerType === 'Group' ? ownerId : undefined,
        userOwnerId: ownerType === 'User' ? ownerId : undefined,
        title: title,
        id: id,
      }
    });
    if (workspace)
      readWorkspaceResult.workspace = workspace;
  } else {
    const workspace = await prisma.workspace.findFirst({
      where: {
        title: title,
        id: id,
      }
    });
    if (workspace)
      readWorkspaceResult.workspace = workspace;
  }
  
  return readWorkspaceResult;
}

export async function updateWorkspace(prisma:PrismaClient, data:WorkspaceData, workspaceId:number) : Promise<WorkspaceQueryResult> {
  const workspaceQueryResult = initWorkspaceQueryResult();
  
  const { ownerId, ownerType, title, description } = data;
  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId
    },
    data: {
      title,
      description,
      orgOwnerId: ownerType === 'Organization' ? ownerId : undefined,
      groupOwnerId: ownerType === 'Group' ? ownerId : undefined,
      userOwnerId: ownerType === 'User' ? ownerId : undefined,
    }
  });
  if (workspace === null)
    return workspaceQueryResult;
  workspaceQueryResult.workspace = workspace;

  return workspaceQueryResult;
}

export async function deleteWorkspace(prisma:PrismaClient, workspaceId:number) : Promise<boolean> {
  try {
    await prisma.workspace.delete({ where: { id: workspaceId }});
  } catch(e) {
    return false;
  }
  return true;
}
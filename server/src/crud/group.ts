import { Group, PrismaClient, User } from "@prisma/client"

export type GroupData = {
  name:        string,
  description: string,
  users?:      User[],
  ownerId:     number,
  ownerType:   string
};

export type GroupParams = {
  ownerId?:   number,
  ownerType?: string,
  id?:        number,
  name?:      string
};

export type GroupQueryResult = {
  group?:  Group,
  error:  boolean,
  exists: boolean
};

function initGroupQueryResult() : GroupQueryResult {
  return {
    error: false,
    exists: false
  };
}

async function createGroup(prisma:PrismaClient, data:GroupData) : Promise<GroupQueryResult> {
  const createGroupRes = initGroupQueryResult();
  try {
    const group = await prisma.group.create({ data: {
      name: data.name,
      description: data.description,
      organizationOwnerId: data.ownerType === 'Organization' ? data.ownerId : undefined,
      userOwnerId: data.ownerType === 'User' ? data.ownerId : undefined,
    }});

    createGroupRes.group = group;
  } catch(e) {
    console.error((e as Error).message);
    createGroupRes.exists = true;
  }

  return createGroupRes;
}

async function readGroup(prisma:PrismaClient, params:GroupParams) : Promise<GroupQueryResult> {
  const readGroupRes = initGroupQueryResult();

  try {
    const group = await prisma.group.findFirst({ where: {
      name: params.name,
      id: params.id,
      userOwnerId: params.ownerType === 'User' ? params.ownerId : undefined,
      organizationOwnerId: params.ownerType === 'Organization' ? params.ownerId : undefined
    }});

    if (group) readGroupRes.group = group;
  } catch(e) {
    readGroupRes.error = true;
  }

  return readGroupRes;
}

async function updateGroup(prisma:PrismaClient, data:GroupData, groupId:number) : Promise<GroupQueryResult> {
  const updateGroupRes = initGroupQueryResult();
  try {
    const group = await prisma.group.update({
      where: {
        id: groupId
      },
      data: {
        name: data.name,
        description: data.description,
        organizationOwnerId: data.ownerType === 'Organization' ? data.ownerId : undefined,
        userOwnerId: data.ownerType === 'User' ? data.ownerId : undefined,
      }
    });

    updateGroupRes.group = group;
  } catch(e) {
    console.error((e as Error).message);
    updateGroupRes.exists = true;
  }

  return updateGroupRes;
}

async function deleteGroup(prisma:PrismaClient, groupId:number) : Promise<boolean> {
  const group = await prisma.group.delete({ where: { id: groupId }});
  if (group !== null) return true  
  return false;
}

export { createGroup, readGroup, updateGroup, deleteGroup };
import { Group, PrismaClient } from "@prisma/client";
import { createUsers } from "./mockUsers";
import { GroupData, createGroup, deleteGroup, readGroup, updateGroup } from "../src/crud/group";

describe('Group CRUD functions', () => {
  let prisma:PrismaClient;

  beforeAll(() => prisma = new PrismaClient());
  afterAll(async() => await prisma.$disconnect());

  test('Create a new Group owned by a User', async() => {
    const user = (await createUsers(1, prisma))[0];

    const { group, error, exists } = await createGroup(prisma, {
      name: 'Group 1',
      description: 'This is Group 1',
      ownerId: user.id,
      ownerType: 'User'
    });

    try {
      expect(group).toBeDefined();
      expect(exists).toBe(false);
      expect(error).toBe(false);
    } finally {
      if (group) await prisma.group.delete({ where: { id: group.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Read a Group owned by a user', async() => {
    const user = (await createUsers(1, prisma))[0];
    const _group = await prisma.group.create({
      data: {
        name: 'Group 1',
        description: 'This is Group 1',
        userOwnerId: user.id
      }
    });
    
    const { group, error, exists } = await readGroup(prisma, {
      name: _group.name,
      ownerId: user.id,
      ownerType: 'User',
      id: _group.id
    });

    try {
      expect(group).toBeDefined();
      expect(error).toBe(false);
      expect(exists).toBe(false);
    } finally {
      if (_group) await prisma.group.delete({ where: { id: _group.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Update a Group', async() => {
    const user = (await createUsers(1, prisma))[0];
    const groupData:GroupData = {
      name: 'Group 1',
      description: 'This is Group 1',
      ownerId: user.id,
      ownerType: 'User'
    }
    const _group = await prisma.group.create({
      data: {
        name: groupData.description,
        description: groupData.description,
        userOwnerId: user.id
      }
    });
    
    groupData.name = 'Cavemen';
    groupData.description = 'Ooga ooga caveman brain from writing many test';

    const { group, error, exists } = await updateGroup(prisma, groupData, _group.id);
    
    try {
      expect(group).toBeDefined();
      expect(error).toBe(false);
      expect(exists).toBe(false);
      expect(group?.name).toBe(groupData.name);
      expect(group?.description).toBe(groupData.description);
    } finally {
      if (_group) await prisma.group.delete({ where: { id: _group.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Delete a Group', async() => {
    const user = (await createUsers(1, prisma))[0];
    const group = await prisma.group.create({ 
      data: {
        name: 'Group 1',
        description: 'This is Group 1',
        userOwnerId: user.id
      }
    });

    let deleted = false;
    try {
      deleted = await deleteGroup(prisma, group.id);
      expect(deleted).toBe(true);
    } finally {
      if (!deleted) await prisma.group.delete({ where: { id: group.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });
})
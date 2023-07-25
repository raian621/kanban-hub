import { PrismaClient, Workspace } from "@prisma/client";
import { createUsers } from "./mockUsers";
import { WorkspaceData, WorkspaceParams, createWorkspace, deleteWorkspace, readWorkspace, updateWorkspace } from "../src/crud/workspace";


describe('Workspace CRUD functions', () => {
  let prisma:PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async() => {
    await prisma.$disconnect();
  });

  test('Create new Workspace owned by a User', async() => {
    const user = (await createUsers(1, prisma))[0];
    const workspaceData:WorkspaceData = {
      ownerId: user.id,
      ownerType: 'User',
      title: 'Title',
      description: 'Lorem ipsum'
    };

    const createWorkspaceResult = await createWorkspace(prisma, workspaceData);
    const { workspace } = createWorkspaceResult;
    try {
      expect(createWorkspaceResult.exists).toBe(false);
      expect(createWorkspaceResult.error).toBe(false);
      expect(workspace).toBeDefined();
      expect((workspace as Workspace).title).toBe(workspaceData.title);
      expect((workspace as Workspace).description).toBe(workspaceData.description);
      expect((workspace as Workspace).userOwnerId).toBe(workspaceData.ownerId);
    } finally {
      if (workspace)
        await prisma.workspace.delete({ where: { id: workspace.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Read a workspace owned by a User', async() => {
    const user = (await createUsers(1, prisma))[0];
    const workspaceData:WorkspaceData = {
      ownerId: user.id,
      ownerType: 'User',
      title: 'Title',
      description: 'Lorem ipsum'
    }

    const createWorkspaceResult = await createWorkspace(prisma, workspaceData);
    const { workspace } = createWorkspaceResult;
    try {
      expect(createWorkspaceResult.exists).toBe(false);
      expect(createWorkspaceResult.error).toBe(false);
      expect(createWorkspaceResult.workspace).toBeDefined();

      const workspaceSearchParams:WorkspaceParams = {
        id: workspace?.id
      }
      const workspaceReadResult = await readWorkspace(prisma, workspaceSearchParams);
      const workspaceRead = workspaceReadResult.workspace as Workspace;

      expect(workspaceRead).toBeDefined();
      expect(workspace?.id).toBe(workspaceRead.id);
      expect(workspace?.userOwnerId).toBe(workspaceRead.userOwnerId);
      expect(workspace?.title).toBe(workspaceRead.title);
      expect(workspace?.description).toBe(workspaceRead.description);
    } finally {
      if (workspace)
        await prisma.workspace.delete({ where: { id: workspace.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Update a workspace owned by a User', async() => {
    const user = (await createUsers(1, prisma))[0];
    const workspaceData:WorkspaceData = {
      ownerId: user.id,
      ownerType: 'User',
      title: 'Title',
      description: 'Lorem ipsum'
    }

    const createWorkspaceResult = await createWorkspace(prisma, workspaceData);
    let { workspace } = createWorkspaceResult;
    try {
      expect(createWorkspaceResult.exists).toBe(false);
      expect(createWorkspaceResult.error).toBe(false);
      expect(createWorkspaceResult.workspace).toBeDefined();
      
      workspaceData.title = 'Title2';
      workspaceData.description = 'Lorem ipsum dos';

      const updateWorkspaceResult = await updateWorkspace(prisma, workspaceData);
      expect(updateWorkspaceResult.workspace).toBeDefined();
      workspace = updateWorkspaceResult.workspace as Workspace;
      expect(updateWorkspaceResult.exists).toBe(false);
      expect(updateWorkspaceResult.error).toBe(false);
    } finally {
      if (workspace)
        await prisma.workspace.delete({ where: { id: workspace.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Delete a Workspace owned by a User', async() => {
    const user = (await createUsers(1, prisma))[0];
    const workspaceData:WorkspaceData = {
      ownerId: user.id,
      ownerType: 'User',
      title: 'Title',
      description: 'Lorem ipsum'
    }

    const createWorkspaceResult = await createWorkspace(prisma, workspaceData);
    const { workspace } = createWorkspaceResult;
    try {
      expect(createWorkspaceResult.exists).toBe(false);
      expect(createWorkspaceResult.error).toBe(false);
      expect(createWorkspaceResult.workspace).toBeDefined();

      const result = await deleteWorkspace(prisma, (workspace as Workspace).id);     
      expect(result).toBe(true);
      const workspaceCount = prisma.workspace.count({ where: {
        id: (workspace as Workspace).id
      }});
      expect(workspaceCount).toBe(0);
    } finally {
      if (workspace)
        await prisma.workspace.delete({ where: { id: workspace.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  })
});
import { Organization, PrismaClient } from "@prisma/client";
import { createUsers } from "./mockUsers";
import { OrganizationData, createOrganization, deleteOrganization, readOrganization, updateOrganization } from "../src/crud/organization";

describe('Organization CRUD functions', () => {
  let prisma:PrismaClient;

  beforeAll(() => prisma = new PrismaClient());
  afterAll(async() => await prisma.$disconnect());

  test('Create a new Organization', async() => {
    const user = (await createUsers(1, prisma))[0];
    const organizationData:OrganizationData = {
      ownerId: user.id,
      name: 'Organization 1',
      description: 'This is Organization 1'
    };

    const createOrganizationRes = await createOrganization(prisma, organizationData);
    const { organization } = createOrganizationRes;
    try {
      expect(createOrganizationRes.exists).toBe(false);
      expect(createOrganizationRes.error).toBe(false);
      expect(organization).toBeDefined();
      expect((organization as Organization).name).toBe(organizationData.name);
      expect((organization as Organization).description).toBe(organizationData.description);
      expect((organization as Organization).userOwnerId).toBe(organizationData.ownerId)
    } finally {
      if (organization) await prisma.organization.delete({ where: { id: organization.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Read an Organization', async() => {
    const user = (await createUsers(1, prisma))[0];

    const organization = await prisma.organization.create({
      data: {
        userOwnerId: user.id,
        name: 'Organization 1',
        description: 'This is Organization 1'
      }
    });

    try {
      expect(organization).not.toBeNull();
      const readOrgRes = await readOrganization(prisma, {
        ownerId: user.id,
        name: organization.name,
        id: organization.id
      });

      expect(readOrgRes.organization).toBeDefined();
      expect(readOrgRes.error).toBe(false);
      expect(readOrgRes.exists).toBe(false);
    } finally {
      if (organization) await prisma.organization.delete({ where: { id: organization.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Update an Organization', async() => {
    const user = (await createUsers(1, prisma))[0];

    const organization = await prisma.organization.create({
      data: {
        userOwnerId: user.id,
        name: 'Organization 1',
        description: 'This is Organization 1'
      }
    });

    try {
      expect(organization).not.toBeNull();
      const updateOrgRes = await updateOrganization(prisma, {
        ownerId: user.id,
        name: organization.name + "1",
        description: organization.description + " big chungus was here"
      }, organization.id);

      expect(updateOrgRes.organization).toBeDefined();
      expect(updateOrgRes.error).toBe(false);
      expect(updateOrgRes.exists).toBe(false);
    } finally {
      if (organization) await prisma.organization.delete({ where: { id: organization.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });
  
  test('Delete an Organization', async() => {
    const user = (await createUsers(1, prisma))[0];
  
    const organization = await prisma.organization.create({
      data: {
        userOwnerId: user.id,
        name: 'Organization 1',
        description: 'This is Organization 1'
      }
    });
  
    let deleted = false;
    try {
      expect(organization).not.toBeNull();
  
      deleted = await deleteOrganization(prisma, organization.id);
      expect(deleted).toBe(true);
    } finally {
      if (organization && !deleted) await prisma.organization.delete({ where: { id: organization.id }});
      await prisma.user.delete({ where: { id: user.id }});
    }
  });
});

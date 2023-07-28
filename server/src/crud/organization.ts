import { Group, Organization, PrismaClient, User } from "@prisma/client";

export type OrganizationData = {
  name:        string,
  description: string,
  users?:      User[],
  groups?:     Group[]
  ownerId:     number
}

export type OrganizationParams = {
  ownerId?: number,
  name?:    string,
  id?:      number
}

export type OrganizationQueryResult = {
  organization?: Organization,
  error:         boolean,
  exists:        boolean
}

function initOrganizationQueryResult() : OrganizationQueryResult {
  return {
    error: false,
    exists: false
  };
}

async function createOrganization(prisma:PrismaClient, data:OrganizationData) 
  : Promise<OrganizationQueryResult>
{
  const createOrgRes = initOrganizationQueryResult();
  const organization = await prisma.organization.create({ 
    data: {
      name: data.name,
      description: data.description,
      userOwnerId: data.ownerId,
      groups: {
        create: data?.groups ? (data?.groups as Group[]).map(group => { 
          return { group: { connect: { id: group.id }}};
        }) : undefined
      }
    }
  });

  if (organization !== null)
    createOrgRes.organization = organization;
  else
    createOrgRes.error = true;

  return createOrgRes;
}

async function readOrganization(prisma:PrismaClient, params:OrganizationParams) 
  : Promise<OrganizationQueryResult>
{
  const readOrgRes = initOrganizationQueryResult();
  const organization = await prisma.organization.findFirst({
    where: {
      name: params.name,
      id: params.id,
      userOwnerId: params.ownerId
    }
  });
  
  if (organization !== null)
    readOrgRes.organization = organization;
  
  return readOrgRes;
}

async function updateOrganization(prisma:PrismaClient, data:OrganizationData, organizationId:number) 
  : Promise<OrganizationQueryResult>
{
  const orgUpdateRes = initOrganizationQueryResult();
  const organization = await prisma.organization.update({
    where: { id: organizationId }, 
    data: {
      name: data.name,
      description: data.description,
      userOwnerId: data.ownerId,
      groups: { 
        create: data?.groups ? (data?.groups as Group[]).map(group => { 
          return { group: { connect: { id: group.id }}};
        }) : undefined
      }
    }
  });

  if (organization !== null)
    orgUpdateRes.organization = organization;
  else
    orgUpdateRes.error = true;

  return orgUpdateRes;
}

async function deleteOrganization(prisma:PrismaClient, organizationId:number) 
  : Promise<boolean>
{
  const organization = await prisma.organization.delete({ where: { id: organizationId }})
  if (organization !== null) return true;
  return false;
}

export { createOrganization, readOrganization, updateOrganization, deleteOrganization };
import { PrismaClient, User } from "@prisma/client";
import { hash as argonHash } from 'argon2';

export type UserReturnStatus = {
  user?: User,
  exists: boolean,
  error: boolean
}

function initUserReturnStatus(): UserReturnStatus {
  return {
    exists: false,
    error: false
  };
}

export type CleanUser = {
  id: number
  username: string,
  firstName: string,
  lastName: string,
  email: string
}

type CreateUserBody = {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string
}

type ReadUserParams = {
  username?: string
}

export async function createUser(prisma:PrismaClient, body:CreateUserBody) : Promise<UserReturnStatus> {
  const firstName = body?.firstName;
  const lastName =  body?.lastName;
  const email =     body?.email;
  const username =  body?.username;
  const password =  body?.password;

  const userReturnStatus = initUserReturnStatus();

  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined ||
    username === undefined ||
    password === undefined
  ) {
    console.log(`[POST /users]: Request to create user \`${username}\` failed due to missing field`);
    userReturnStatus.error = true;
    return userReturnStatus;
  }

  const passhash = await argonHash(password);

  try {
    userReturnStatus.user = await prisma.user.create({data: {
      firstName, lastName, email, username, passhash
    }});
  } catch(e) {
    console.error((e as Error).message);
    userReturnStatus.exists = true;
  }

  return userReturnStatus;
}

export async function readUser(prisma:PrismaClient, params:ReadUserParams):Promise<CleanUser|null> {
  const username = params?.username;
  console.log(`[GET /users/${username}]: Request for user '${username}' public info`);
  let user:User|null = null;

  try {
    user = await prisma.user.findFirstOrThrow({
      where: { username: username }
    });
    const { id, firstName, lastName, email } = user;
    return { id, username: username as string, firstName, lastName, email };
  } catch (e) {
    console.error((e as Error).message);
    return null;
  }
}
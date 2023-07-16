import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { hash as argonHash } from 'argon2';

type TestUser = {
  id: number,
  firstName:string,
  lastName:string,
  email:string,
  username:string,
  password:string,
  passhash: string
}

function createFakeUserData() {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const username = faker.internet.userName({ firstName, lastName });
  const password = faker.internet.password();

  return { firstName, lastName, email, username, password };
}

async function createUsers(numUsers:number, prisma:PrismaClient): Promise<TestUser[]> {
  const users:TestUser[] = [];

  for (let i = 0; i < numUsers; i++) {
    const { firstName, lastName, email, username, password } = createFakeUserData();
    const passhash = await argonHash(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        passhash
      }
    });

    users.push({ 
      id: user.id, firstName, lastName, email, username, password, passhash
    });
  }
  return users;
}

export { TestUser, createFakeUserData, createUsers };
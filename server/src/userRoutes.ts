import express, { NextFunction, Request, Response } from 'express';
import { hash as argonHash, verify as argonVerify } from 'argon2';
import { User } from '@prisma/client';
import { prisma } from './app';

type UserSessionData = {
  username?: string,
  authenticated?: boolean
}

declare module 'express-session' {
  export interface SessionData {
    data: UserSessionData
  }
}

const userRoutes = express.Router();

/**
 * ROUTE: POST /users
 * ----------------------------
 * Used to create / register users
 * 
 * - Request body must be a JSON that is some variation of
 *    {
 *      "username":  <username>,
 *      "password":  <password>,
 *      "firstName": <first-name>,
 *      "lastName":  <last-name>,
 *      "email":     <email>
 *    }
 * 
 * TODO: add verification to each field i.e. make sure `email` field is
 * a valid email, etc.
 */
userRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[POST /users]: Request to create user with data ${req.body}`);
  res.setHeader('Content-Type', 'application/json');
  
  const firstName = req.body?.firstName;
  const lastName =  req.body?.lastName;
  const email =     req.body?.email;
  const username =  req.body?.username;
  const password =  req.body?.password;
  
  // if any of the required data is missing, return a 400 status
  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined ||
    username === undefined ||
    password === undefined
  ) {
    res.status(400).end();
    next();
    return;
  }

  console.log(password);
  const passhash = await argonHash(password);

  try {
    const user = await prisma.user.create({data: {
      firstName, lastName, email, username, passhash
    }});
    res.status(201).json({
      username:  user.username,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email
    });
  } catch(e) {
    // console.error((e as Error).message);
    res.status(204).end();
  }
  next();
});

/**
 * ROUTE: GET /users/<username>
 * ----------------------------
 * Fetches basic information on a user with username `<username>`
 * 
 * - Responds with a JSON like
 *      {
 *        "username": <username>,
 *        "firstName": <firstName>,
 *        "lastName": <lastName>,
 *        "email": <email>
 *      }
 * 
 * IMPORTANT: this route does NOT return the users `passhash` since
 * I'm pretty sure people can unhash passwords given enough time.
 * I've read that Argon2 is more resistant to unhashing than other
 * hashing schemes but I'm not taking any chances
 */
userRoutes.get('/:username', async(req: Request, res: Response) => {
  const username = req.params.username;
  console.log(`[GET /users/${username}]: Request for user '${username}' public info`);
  
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { username: username }
    });

    return res.status(200).json({
      username:  user.username,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email
    });
  } catch (e) {
    console.error((e as Error).message);
    return res.status(204).end();
  }
});

/**
 * ROUTE: POST /users/login
 * ----------------------------
 * Used to "log in" a user by using their username and password; 
 * sends a session cookie to client used to authenticate subsequent
 * transactions
 * 
 * - Must provide credentials in JSON format like so:
 *    {
 *      "username": <username>
 *      "password": <password>
 *    }
 */
userRoutes.post('/login', async(req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const username = req.body?.username;
  const password = req.body?.password;
  
  if (username && password) {
    console.log(`[POST /users/login] Request to log in as user ${username}`);

    const user = await prisma.user.findFirst({ where: { username: req.body.username }});
    if (await argonVerify((user as User).passhash, password)) {
      req.session.data = {
        username: username,
        authenticated: true
      };
      console.log('Login successful!');
    } else
      return res.status(400).send('Login unsuccessful');

    res.json({ username, authenticated: true });
  } else {
    return res.end(400);
  }
  next();
});

/**
 * ROUTE: GET /users
 * ----------------------------
 * Used to retrieve private user information like user id, username,
 * and session authentication status.
 * 
 * - Client must have cookies enabled and have a valid session cookie
 * in order to retrieve their information.
 * 
 * NOTE: semantically, this route name doesn't make much sense,
 * GET /users should probably return a list of users, but whatever
 */
userRoutes.get('/', async(req: Request, res: Response, next: NextFunction) => {
  console.log(`[GET /users] Request for session information from ${req.session.data?.username}`);
  res.json(req.session.data);
  next();
});

export default userRoutes;
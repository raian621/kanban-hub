import { Group, Organization, PrismaClient, User, Board } from "@prisma/client";
import { SessionData } from "express-session";

export type BoardData = {
  ownerId: number,
  ownerType: string,
  title: string,
  description: string
  workspaceId?: number
}

export function createBoard(prisma:PrismaClient, session:SessionData, data:BoardData) {
  return;
}

export function readBoard(prisma:PrismaClient, session:SessionData, data:BoardData) {
  return;
}

export function updateBoard(prisma:PrismaClient, session:SessionData, data:BoardData) {
  return;
}

export function deleteBoard(prisma:PrismaClient, session:SessionData, data:BoardData) {
  return;
}
import { Group, Organization, PrismaClient, User, Card } from "@prisma/client";
import { SessionData } from "express-session";

export type CardData = {
  ownerId: number,
  ownerType: string,
  title: string,
  description: string  
}

export function createCard(prisma:PrismaClient, session:SessionData, data:CardData) {
  return;
}

export function readCard(prisma:PrismaClient, session:SessionData, data:CardData) {
  return;
}

export function updateCard(prisma:PrismaClient, session:SessionData, data:CardData) {
  return;
}

export function deleteCard(prisma:PrismaClient, session:SessionData, data:CardData) {
  return;
}
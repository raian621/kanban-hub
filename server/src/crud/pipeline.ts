import { Group, Organization, PrismaClient, User, Pipeline } from "@prisma/client";
import { SessionData } from "express-session";

export type PipelineData = {
  ownerId: number,
  ownerType: string,
  title: string,
  description: string
  boardId: number
}

export function createPipeline(prisma:PrismaClient, data:PipelineData) {
  return;
}

export function readPipeline(prisma:PrismaClient, data:PipelineData) {
  return;
}

export function updatePipeline(prisma:PrismaClient, data:PipelineData) {
  return;
}

export function deletePipeline(prisma:PrismaClient, data:PipelineData) {
  return;
}
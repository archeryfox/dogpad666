// dogpad.backend/prisma/prisma.js
import {PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
export const prisma = new PrismaClient().$extends(withAccelerate());
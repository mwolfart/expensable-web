import type { User } from "@prisma/client";
import { db } from "@utils/db";
import bcrypt from "bcrypt";

export const findUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUserByEmailAndPassword = (user: User) => {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
};

export const findUserById = (id: string) => {
  return db.user.findUnique({
    where: {
      id,
    },
  });
};

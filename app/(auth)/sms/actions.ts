"use server";

import { z } from "zod";
import crypto from "crypto";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import twilio from "twilio";
import { saveSession } from "@/lib/session";

const phoneSchema = z
  .string()
  .trim()
  .refine((phone) => validator.isMobilePhone(phone, "ko-KR"), "Wrong phone format");

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return Boolean(exists);
}

const tokenSchema = z.coerce.number().min(100000).max(999999).refine(tokenExists, "This token does not exist");

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  } else {
    return token;
  }
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return { token: false, error: result.error.flatten() };
    } else {
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          phone: phone?.toString(),
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });
      // 개편 이슈로 메세지 전송 불가
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTO_TOKEN!);
      // await client.messages.create({
      //   body: `Your Karrot verification code in: ${token}`,
      //   from: process.env.TWILIO_PHONE_NUMBER!,
      //   to: process.env.MY_PHONE_NUMBER!,
      // });
      return {
        token: true,
      };
    }
  } else {
    const result = await tokenSchema.spa(token);
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
        // return the error
      };
    } else {
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
          phone: formData.get("phone") + "",
        },
        select: {
          id: true,
          userId: true,
        },
      });
      console.log(token);
      if (token) {
        await saveSession(token!.userId);
      }
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });
      // log the user in
      redirect("/profile");
    }
  }
  // const token = Math.floor(Math.random() * 900000) + 100000;
  // return { token: true, token };
}

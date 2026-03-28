import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 12);

    const exists = await db.findOne('users', { email });
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    await db.insert('users', {
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}

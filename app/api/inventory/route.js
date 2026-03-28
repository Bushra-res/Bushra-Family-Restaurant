import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await db.read('inventory');
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newItem = await db.insert('inventory', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, ...updateData } = await req.json();
    const updatedItem = await db.update('inventory', { _id: id }, updateData);
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

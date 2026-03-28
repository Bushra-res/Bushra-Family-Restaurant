import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const customers = await db.find('users', { role: 'customer' });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        const updatedCustomer = await db.update('users', { _id: id }, updateData);
        return NextResponse.json(updatedCustomer);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

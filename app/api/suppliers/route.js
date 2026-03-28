import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const suppliers = await db.read('suppliers');
        return NextResponse.json(suppliers);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const newSupplier = await db.insert('suppliers', data);
        return NextResponse.json(newSupplier, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        const updatedSupplier = await db.update('suppliers', { _id: id }, updateData);
        return NextResponse.json(updatedSupplier);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

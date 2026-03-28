import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tables = await db.read('tables');
        return NextResponse.json(tables);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const newTable = await db.insert('tables', { ...data, status: 'available' });
        return NextResponse.json(newTable);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        if (!id) return NextResponse.json({ error: 'Table ID required' }, { status: 400 });

        // Normalize special values if needed
        if (updateData.status === 'available') {
            updateData.currentOrder = null;
        }

        const updatedTable = await db.update('tables', { _id: id }, updateData);
        return NextResponse.json(updatedTable);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID required');
        await db.delete('tables', { _id: id });
        return NextResponse.json({ message: 'Table deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

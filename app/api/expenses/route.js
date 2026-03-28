import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const expenses = (await db.read('expenses')) || [];
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const expense = await db.insert('expenses', data);
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID required');
        await db.delete('expenses', { _id: id });
        return NextResponse.json({ message: 'Expense deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

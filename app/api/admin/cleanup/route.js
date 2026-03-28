import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function POST(req) {
    try {
        // Clear orders and potentially other sales related data if needed
        await db.delete('orders', {}); // Delete all orders
        
        // Optionally clear transactions or logs if they exist
        // await db.delete('transactions', {});

        return NextResponse.json({ message: 'Sales data cleared successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

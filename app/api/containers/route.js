import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        let containers = await db.read('containers');
        
        // Seed default containers if none exist
        if (!containers || containers.length === 0) {
            const defaultContainers = [
                { name: 'Container Box', price: 10, isAvailable: true },
                { name: 'Gravy Cups', price: 5, isAvailable: true }
            ];
            
            for (const container of defaultContainers) {
                await db.insert('containers', container);
            }
            // Re-fetch to ensure we have the IDs
            containers = await db.read('containers');
        }

        // Sort by name
        containers.sort((a, b) => a.name.localeCompare(b.name));
        return NextResponse.json(containers);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const newContainer = await db.insert('containers', data);
        return NextResponse.json(newContainer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        
        await db.update('containers', { _id: id }, updateData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        
        await db.delete('containers', { _id: id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

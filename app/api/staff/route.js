import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const staff = await db.find('users', { role: { $in: ['cashier', 'delivery'] } });
        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 12);

        const newStaff = await db.insert('users', {
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }
        const updatedStaff = await db.update('users', { _id: id }, updateData);
        return NextResponse.json(updatedStaff);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        await db.update('users', { _id: id }, { isActive: false });
        return NextResponse.json({ message: 'Staff deactivated' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

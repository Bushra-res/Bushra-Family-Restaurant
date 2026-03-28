import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const coupons = await db.read('coupons');
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const newCoupon = await db.insert('coupons', data);
        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, ...updateData } = await req.json();
        const updatedCoupon = await db.update('coupons', { _id: id }, updateData);
        return NextResponse.json(updatedCoupon);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

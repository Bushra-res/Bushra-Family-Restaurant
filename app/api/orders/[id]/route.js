import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const order = await db.findById('orders', id);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = params;
        const data = await req.json();

        // Update the order
        await db.update('orders', { _id: id }, data);
        const updatedOrder = await db.findById('orders', id);

        if (!updatedOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // If completed or cancelled, free up the table
        const isFinished = data.status === 'completed' || data.status === 'cancelled';
        if (isFinished) {
            const tableId = updatedOrder.table || updatedOrder.tableId;
            const isDineIn = updatedOrder.orderType === 'dine-in' || updatedOrder.type === 'dine-in';
            
            if (isDineIn && tableId) {
                await db.update('tables', { _id: tableId }, { status: 'available', currentOrder: null });
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Order update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        const order = await db.findById('orders', id);
        if (order) {
            const tableId = order.table || order.tableId;
            const isDineIn = order.orderType === 'dine-in' || order.type === 'dine-in';
            
            if (isDineIn && tableId) {
                await db.update('tables', { _id: tableId }, { status: 'available', currentOrder: null });
            }
        }

        await db.delete('orders', { _id: id });
        return NextResponse.json({ message: "Order deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

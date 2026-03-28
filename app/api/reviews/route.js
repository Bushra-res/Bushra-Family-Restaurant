import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const reviews = await db.read('reviews');
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const newReview = await db.insert('reviews', data);

        // Update menu item average rating
        const itemReviews = await db.find('reviews', { item: data.item });
        const avgRating = itemReviews.reduce((acc, rev) => acc + rev.rating, 0) / itemReviews.length;
        await db.update('menuitems', { _id: data.item }, { rating: avgRating });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
    try {
        const categories = await db.read('categories');
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, image } = await req.json();
        
        let finalImage = image;
        if (image && image.startsWith('data:image')) {
            const uploadResult = await uploadImage(image, 'categories');
            finalImage = uploadResult.url;
        }

        const newCategory = await db.insert('categories', { name, image: finalImage });
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

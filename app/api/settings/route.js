import Settings from "@/models/Settings";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        const settings = await Settings.findOne({}).lean();
        return NextResponse.json(settings || { 
            restaurantName: 'BUSHRA FAMILY RESTAURANT',
            billHeader: '⭐ Halal Certified | Premium Dining ⭐\n📍 496/2 Bangalore Main Road,\nSS Lodge Ground Floor, Chengam - 606 709\n📞 8838993915 | 9361066673',
            phone: '8838993915, 9361066673',
            billFooter: '🎉 THANK YOU FOR DINING WITH US! 🎉\n❤️ We hope you enjoyed your meal',
            taxPercentage: 5
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, __v, createdAt, updatedAt, ...data } = body;
        
        let settings = await Settings.findOne({});
        
        if (settings) {
            Object.assign(settings, data);
            await settings.save();
        } else {
            settings = await Settings.create(data);
        }
        
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    return POST(req); // Settings is usually a single document
}

export const dynamic = 'force-dynamic';

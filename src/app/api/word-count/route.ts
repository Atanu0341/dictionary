import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(){
    try {
       const count = await prisma.entry.count();
       return NextResponse.json({ count }); 
    } catch (error) {
        console.error('Error fetching word count:', error);
    return NextResponse.json({ error: 'Failed to fetch word count' }, { status: 500 });
    }
}
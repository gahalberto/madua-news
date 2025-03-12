import { NextRequest, NextResponse } from "next/server";
import { comparePasswords } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { password, hashedPassword } = await request.json();
    
    const isValid = await comparePasswords(password, hashedPassword);
    
    return NextResponse.json({ isValid });
  } catch (error: unknown) {
    console.error("Erro ao verificar senha:", error);
    return NextResponse.json(
      { error: "Erro ao verificar senha" },
      { status: 500 }
    );
  }
} 
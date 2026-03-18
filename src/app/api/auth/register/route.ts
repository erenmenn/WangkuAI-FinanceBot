import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validasi
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Data tidak valid. Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi minimal 2 karakter." },
        { status: 400 }
      );
    }

    // Cek email exist
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email, password: hashed },
    });

    // Init saldo 0 untuk user baru
    await prisma.balance.create({ data: { userId: user.id, current: 0 } });

    return NextResponse.json({ success: true, message: "Akun berhasil dibuat!" });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/schema/contactSchema";
import { db } from "../../../prisma/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validation.data;

    // Create contact entry in database
    const contact = await db.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "NEW",
      },
    });

    return NextResponse.json(
      { message: "Contact form submitted successfully", contact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
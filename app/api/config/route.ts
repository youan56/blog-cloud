import { NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/storage";

/** GET - 读取配置 */
export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("读取配置失败:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** POST - 保存配置 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await saveConfig(body);
    return NextResponse.json({ success: true, message: "配置已保存", storage: result.storage });
  } catch (error) {
    console.error("保存配置失败:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

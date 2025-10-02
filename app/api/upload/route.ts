import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const title = form.get('title')?.toString() || '';
    const body = form.get('body')?.toString() || '';

    const files: Array<File> = [];
    for (const entry of form.entries()) {
      const [key, val] = entry as [string, any];
      if (key === 'images') {
        files.push(val as File);
      }
    }

    const uploaded: string[] = [];

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_CONTAINER_NAME;

    if (connectionString && containerName) {
      const blobService = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobService.getContainerClient(containerName);
      // ensure container exists
      await containerClient.createIfNotExists();

      for (const f of files) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const ext = path.extname((f as any).name || '') || '.jpg';
        const blobName = `${uuidv4()}${ext}`;
        const blockClient = containerClient.getBlockBlobClient(blobName);
        await blockClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: f.type || 'application/octet-stream' } });
        uploaded.push(blockClient.url);
      }
    } else {
      // save to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      for (const f of files) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const ext = path.extname((f as any).name || '') || '.jpg';
        const filename = `${uuidv4()}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        uploaded.push(`/uploads/${filename}`);
      }
    }

    // For now, we just return the uploaded urls and the text data.
    return NextResponse.json({ ok: true, title, body, images: uploaded });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

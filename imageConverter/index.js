import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";

const s3 = new S3Client({ region: 'eu-central-1' });

export const handler = async (event) => {
  try {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    console.log('key', key)

    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const { Body } = await s3.send(getObjectCommand);

    const byteArray = await Body.transformToByteArray();
    const originalImage = Buffer.from(byteArray);

    const baseName = path.basename(key, path.extname(key));
    const newKey = `converted-${baseName}.png`;

    const bmpImage = await sharp(originalImage)
      .toFormat("png")
      .toBuffer();

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: newKey,
      Body: bmpImage,
      ContentType: "image/bmp",
    });

    await s3.send(putObjectCommand);

    console.log(`Successfully converted ${key} to ${newKey}`);
    return {
      statusCode: 200,
      body: `Image converted and uploaded as ${newKey}`,
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

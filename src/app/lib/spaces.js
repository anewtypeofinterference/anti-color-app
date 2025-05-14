// src/lib/spaces.js
import { S3Client, PutObjectCommand, DeleteObjectCommand }
  from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

export const spaces = new S3Client({
  region:     "us-east-1",                       // DO uses us-east-1 for SigV4
  endpoint:   process.env.DO_SPACES_ENDPOINT,
  credentials:{
    accessKeyId:     process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

/** Buffer → public URL in Spaces */
export async function uploadBuffer(buf, mime = "application/octet-stream") {
  const key = uuid();
  await spaces.send(
    new PutObjectCommand({
      Bucket:       process.env.DO_SPACES_BUCKET,
      Key:          key,
      Body:         buf,
      ContentType:  mime,
      ACL:          "public-read",
    })
  );
  return `${process.env.DO_SPACES_BUCKET}.` +
         `${process.env.DO_SPACES_ENDPOINT.replace(/^https?:\/\//,"")}` +
         `/${key}`;
}

export async function deleteKey(key){
  await spaces.send(
    new DeleteObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key:    key,
    })
  );
}
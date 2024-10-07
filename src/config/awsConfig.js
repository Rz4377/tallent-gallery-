// backend/config/awsConfig.js
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const s3ClientInfo = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3ClientInfo;
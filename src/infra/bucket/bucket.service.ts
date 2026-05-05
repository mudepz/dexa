import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { extension } from "mime-types";
import { ConstService } from "../const/const.service";

@Injectable()
export class BucketService implements OnModuleInit {
    private client!: S3Client;

    constructor(private readonly constS: ConstService) {
    }

    onModuleInit() {
        this.client = new S3Client({
            region: this.constS.config.minio.region,
            credentials: {
                accessKeyId: this.constS.config.minio.user,
                secretAccessKey: this.constS.config.minio.password
            },
        })
    }

    async uploadBase64(base64: string, key: string) {
        const [metadata, data] = base64.split(',');
        if (!metadata || !data) {
            throw new InternalServerErrorException('Invalid Base64 string');
        }

        const contentType = metadata.split(':')[1].split(';')[0]; // Extract content type (e.g., "data:image/png;base64")
        const envKey = `${this.constS.config.environment}/${key}.${extension(contentType)}`;
        const buffer = Buffer.from(data, 'base64'); // Convert the Base64 string to a Buffer
        const command = new PutObjectCommand({
            Bucket: this.constS.config.minio.bucketName,
            Body: buffer,
            ContentType: contentType,
            Key: envKey,
        })

        try {
            await this.client.send(command)
            return envKey
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'I-BS-UPB-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'I-BS-UPB-01')
        }
    }

    async getUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.constS.config.minio.bucketName,
            Key: key,
        })

        return await getSignedUrl(this.client, command, {
            expiresIn: 3600
        })
    }

    async deleteKey(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.constS.config.minio.bucketName,
            Key: key,
        })

        try {
            await this.client.send(command)
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'I-BS-DK-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'I-BS-DK-01')
        }
    }

    async copyFile(sourceKey: string, destinationKey: string) {
        const bucket = this.constS.config.minio.bucketName;

        try {
            await this.client.send(
                new CopyObjectCommand({
                    Bucket: bucket,
                    CopySource: `${bucket}/${sourceKey}`,
                    Key: destinationKey,
                }),
            );
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'I-BS-CF-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'I-BS-CF-01')
        }
    }

    async getMetadata(key: string) {
        const headCommand = new HeadObjectCommand({
            Bucket: this.constS.config.minio.bucketName,
            Key: key,
        });

        try {
            const metadata = await this.client.send(headCommand);
            const contentType = metadata.ContentType;

            return { metadata, contentType }
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'I-BS-GM-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'I-BS-GM-01')
        }
    }
}
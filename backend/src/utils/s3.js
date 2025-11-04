const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getEnv } = require('../setup/env');

function getS3() {
	const env = getEnv();
	if (!env.AWS_REGION || !env.AWS_S3_BUCKET) {
		throw new Error('S3 not configured');
	}
	return new S3Client({
		region: env.AWS_REGION,
		credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		} : undefined,
	});
}

module.exports = { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, getS3 };



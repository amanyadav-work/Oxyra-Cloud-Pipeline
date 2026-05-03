package api

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)


func GetS3Client() *s3.Client {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("B2_REGION")),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(os.Getenv("ACCESSKEYID"), os.Getenv("SECRETACCESSKEY"), "")),
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			if service == s3.ServiceID && region == os.Getenv("B2_REGION") {
				return aws.Endpoint{
					URL: os.Getenv("B2_ENDPOINT"),
				}, nil
			}
			return aws.Endpoint{}, fmt.Errorf("unknown endpoint for %s in %s", service, region)
		})),
	)

	if err != nil {
		log.Fatalf("[ERROR] Failed to load S3 config: %v", err)
	}
	return s3.NewFromConfig(cfg)
}



func DeleteProjectFilesFromS3(projectID string) error {
	// Assuming the files are stored under a path like '__outputs/{projectID}/'
	s3Client := GetS3Client() // a function to initialize S3 client
	bucketName := os.Getenv("BUCKETNAME")
	prefix := fmt.Sprintf("__outputs/%s/", projectID)

	// List all objects in the project’s directory
	listObjectsInput := &s3.ListObjectsV2Input{
		Bucket: aws.String(bucketName),
		Prefix: aws.String(prefix),
	}

	resp, err := s3Client.ListObjectsV2(context.TODO(), listObjectsInput)
	if err != nil {
		return fmt.Errorf("failed to list objects for project %s: %v", projectID, err)
	}

	// Delete each object
	for _, obj := range resp.Contents {
		deleteInput := &s3.DeleteObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(*obj.Key),
		}
		_, err := s3Client.DeleteObject(context.TODO(), deleteInput)
		if err != nil {
			return fmt.Errorf("failed to delete object %s: %v", *obj.Key, err)
		}
		log.Printf("[INFO] Deleted file from S3: %s", *obj.Key)
	}

	return nil
}
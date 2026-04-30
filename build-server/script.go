package main

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gabriel-vasile/mimetype"
)

const ACCESSKEYID = "005305f3eb765970000000003"           // Your Backblaze B2 Application Key ID
const SECRETACCESSKEY = "K005E0U9TM8/CJu9o2XZ3eI2WmW64B8" // Your Backblaze B2 Application Key
const BUCKETNAME = "vercel-clone2"                        // Your B2 Bucket Name
var PROJECT_ID = os.Getenv("PROJECT_ID")

const B2_REGION = "us-east-005"                              // Your Backblaze B2 region
const B2_ENDPOINT = "https://s3.us-east-005.backblazeb2.com" // Your Backblaze B2 endpoint

func main() {
	fmt.Println("Executing script.go")

	log.Println("PROJECT_ID: ", PROJECT_ID)

	// Load the AWS SDK config and create an S3 client
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(B2_REGION), // Set your region here
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(ACCESSKEYID, SECRETACCESSKEY, "")),
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			if service == s3.ServiceID && region == B2_REGION {
				return aws.Endpoint{
					URL: B2_ENDPOINT, // Backblaze B2 endpoint
				}, nil
			}
			return aws.Endpoint{}, fmt.Errorf("unknown endpoint for %s in %s", service, region)
		})))

	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	s3Client := s3.NewFromConfig(cfg)

	// Get the current working directory
	dir, err := os.Getwd()
	if err != nil {
		log.Println("Error getting current directory:", err)
		return
	}

	// Set currentDir to the 'output' directory
	currentDir := filepath.Join(dir, "output")

	// Execute `npm install` and `npm run build` commands in the 'output' directory
	cmd := exec.Command("npm", "install")
	cmd.Dir = currentDir // Set the working directory to /home/app/output

	// Capture the stdout and stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatalf("Error creating stdout pipe: %v", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		log.Fatalf("Error creating stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		log.Fatalf("Error starting npm install command: %v", err)
	}

	// Capture stdout and stderr asynchronously
	go func() {
		_, err := io.Copy(os.Stdout, stdout)
		if err != nil {
			log.Printf("Error copying stdout: %v", err)
		}
	}()
	go func() {
		_, err := io.Copy(os.Stderr, stderr)
		if err != nil {
			log.Printf("Error copying stderr: %v", err)
		}
	}()

	// Wait for npm install to complete
	if err = cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for npm install command: %v", err)
	}

	// Run `npm run build` after npm install is completed
	fmt.Println("Running 'npm run build'...")

	cmd = exec.Command("npm", "run", "build")
	cmd.Dir = currentDir // Set the working directory to /home/app/output

	stdout, err = cmd.StdoutPipe()
	if err != nil {
		log.Fatalf("Error creating stdout pipe: %v", err)
	}

	stderr, err = cmd.StderrPipe()
	if err != nil {
		log.Fatalf("Error creating stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		log.Fatalf("Error starting npm run build command: %v", err)
	}

	// Capture stdout and stderr asynchronously
	go func() {
		_, err := io.Copy(os.Stdout, stdout)
		if err != nil {
			log.Printf("Error copying stdout: %v", err)
		}
	}()
	go func() {
		_, err := io.Copy(os.Stderr, stderr)
		if err != nil {
			log.Printf("Error copying stderr: %v", err)
		}
	}()

	// Wait for npm run build to complete
	if err = cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for npm run build command: %v", err)
	}

	// Upload the files from the "dist" folder to S3
	distFolderPath := filepath.Join(dir, "output", "dist")
	err = fs.WalkDir(os.DirFS(distFolderPath), ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			log.Println("Error walking path:", err)
			return err
		}

		// Only upload files (ignore directories)
		if d.IsDir() {
			return nil
		} else {
			log.Printf("Uploading File: %s\n", path)
			// Construct the full file path
			fullFilePath := filepath.Join(distFolderPath, path)

			err := uploadToS3(fullFilePath, path, s3Client)
			if err != nil {
				log.Printf("Failed to upload file: %v, error: %v", path, err)
				return nil
			}
		}
		return nil
	})

	fmt.Println("Build Completed successfully")
}

func uploadToS3(filepath string, originalPath string, client *s3.Client) error {
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	mimeType, err := mimetype.DetectFile(filepath)
	if err != nil {
		return fmt.Errorf("failed to detect MIME type: %v", err)
	}

	contentType := mimeType.String()
	key := fmt.Sprintf("__outputs/%v/%v", PROJECT_ID, originalPath)

	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(BUCKETNAME),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return fmt.Errorf("failed to upload file to s3: %v", err)
	}

	return nil
}





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
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gabriel-vasile/mimetype"
	"github.com/segmentio/kafka-go"
)

var ACCESSKEYID = os.Getenv("ACCESSKEYID")
var SECRETACCESSKEY = os.Getenv("SECRETACCESSKEY")
var BUCKETNAME = os.Getenv("BUCKETNAME")
var PROJECT_ID = os.Getenv("PROJECT_ID")
var DEPLOY_DOMAIN = os.Getenv("DEPLOY_DOMAIN")
var B2_REGION = os.Getenv("B2_REGION")
var B2_ENDPOINT = os.Getenv("B2_ENDPOINT")

// User provided
var SUBDOMAIN = os.Getenv("SUBDOMAIN")
var INSTALL_CMD = os.Getenv("INSTALL_CMD")
var BUILD_CMD = os.Getenv("BUILD_CMD")
var OUTPUT_DIR = os.Getenv("OUTPUT_DIR")
var GIT_ROOT_DIR = os.Getenv("GIT_ROOT_DIR")

var LIVE_URL = fmt.Sprintf("%s.%s", SUBDOMAIN, DEPLOY_DOMAIN)


type KafkaWriter struct {
	writer *kafka.Writer
}

func NewKafkaWriter() *KafkaWriter {
	return &KafkaWriter{
		writer: &kafka.Writer{
			Addr:         kafka.TCP("host.docker.internal:9092"),
			Topic:        "logs",
			MaxAttempts:  5,                // Retry up to 5 times
			RequiredAcks: kafka.RequireAll, // Ensure all replicas acknowledge
			Balancer:     &kafka.LeastBytes{},
		},
	}
}

func (k *KafkaWriter) Write(p []byte) (n int, err error) {
	msg := kafka.Message{
		Key:   []byte(PROJECT_ID),
		Value: p,
		
	}

	fmt.Println("Attempting to write message to Kafka")

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	err = k.writer.WriteMessages(ctx, msg)
	if err != nil {
		fmt.Printf("Error writing to Kafka: %v", err)
	}

	fmt.Println("Message written to Kafka")

	fmt.Printf("%s", p)
	if err != nil {
		fmt.Printf("Error printing to stdout: %v", err)
	}
	return n, err
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[ERROR] Oops! Something went wrong during deployment: %v", r)
		}
	}()

	log.Println("[INFO] Starting your site deployment...")

	kafkaWriter := NewKafkaWriter() // Assuming this is defined elsewhere
	log.SetFlags(0)
	logWriter := io.MultiWriter(os.Stdout, kafkaWriter)
	log.SetOutput(logWriter)

	log.Printf("[INFO] Project ID: %s", PROJECT_ID)

	// Load AWS SDK config and create an S3 client
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(B2_REGION),
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
		log.Fatalf("[ERROR] Unable to load the configuration. Please check your credentials and region: %v", err)
	}

	s3Client := s3.NewFromConfig(cfg)

	// Get the current working directory
	dir, err := os.Getwd()
	if err != nil {
		log.Fatalf("[ERROR] Something went wrong while fetching the directory:", err)
		return
	}

	currentDir := filepath.Join(dir, "output")

	// Check for Git root directory (optional)
	rootDir := GIT_ROOT_DIR
	if rootDir != "" {
		log.Printf("[INFO] Using root directory: %s", rootDir)
		currentDir = filepath.Join(currentDir, rootDir)
	} else {
		log.Println("[INFO] Using default output directory.")
	}

	// Set up the commands for installation and build
	installCmdEnv := INSTALL_CMD
	if installCmdEnv == "" {
		installCmdEnv = "npm install"
	}

	buildCmdEnv := BUILD_CMD
	if buildCmdEnv == "" {
		buildCmdEnv = "npm run build"
	}

	outputDirEnv := OUTPUT_DIR
	if outputDirEnv == "" {
		outputDirEnv = "dist"
	}

	// Step 1: Run the install command
	log.Printf("[INFO] Running installation... (this might take a minute)")

	cmd := exec.Command("sh", "-c", installCmdEnv)
	cmd.Dir = currentDir

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatalf("[ERROR] There was an issue creating the stdout pipe: %v", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		log.Fatalf("[ERROR] There was an issue creating the stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		log.Fatalf("[ERROR] Unable to start the installation process: %v", err)
	}

	// Capture stdout and stderr asynchronously
	go func() {
		_, err := io.Copy(log.Writer(), stdout)
		if err != nil {
			log.Printf("[WARN] There was a problem copying stdout: %v", err)
		}
	}()

	go func() {
		_, err := io.Copy(log.Writer(), stderr)
		if err != nil {
			log.Printf("[WARN] There was a problem copying stderr: %v", err)
		}
	}()

	// Wait for install to complete
	if err = cmd.Wait(); err != nil {
		log.Fatalf("[ERROR] Installation failed. Please check the error and try again: %v", err)
	}

	// Step 2: Run the build command
	log.Printf("[INFO] Installation complete! Now, building your site...")

	cmd = exec.Command("sh", "-c", buildCmdEnv)
	cmd.Dir = currentDir

	stdout, err = cmd.StdoutPipe()
	if err != nil {
		log.Fatalf("[ERROR] Unable to create the stdout pipe for the build process: %v", err)
	}

	stderr, err = cmd.StderrPipe()
	if err != nil {
		log.Fatalf("[ERROR] Unable to create the stderr pipe for the build process: %v", err)
	}

	if err := cmd.Start(); err != nil {
		log.Fatalf("[ERROR] Unable to start the build process: %v", err)
	}

	// Capture stdout and stderr asynchronously
	go func() {
		_, err := io.Copy(os.Stdout, stdout)
		if err != nil {
			log.Printf("[WARN] There was a problem copying stdout during build: %v", err)
		}
	}()

	go func() {
		_, err := io.Copy(os.Stderr, stderr)
		if err != nil {
			log.Printf("[WARN] There was a problem copying stderr during build: %v", err)
		}
	}()

	// Wait for build to complete
	if err = cmd.Wait(); err != nil {
		log.Fatalf("[ERROR] Build failed! Please review the error message: %v", err)
	}

	// Step 3: Upload the files to S3 (or Backblaze B2)
	log.Printf("[INFO] Build completed! Now, uploading your site files...")

	distFolderPath := filepath.Join(dir, "output", outputDirEnv)
	err = fs.WalkDir(os.DirFS(distFolderPath), ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			log.Println("[WARN] Unable to access one of the files: ", err)
			return err
		}

		if d.IsDir() {
			return nil
		} else {
			log.Printf("[INFO] Uploading file: %s", path)
			fullFilePath := filepath.Join(distFolderPath, path)

			err := uploadToS3(fullFilePath, path, s3Client)
			if err != nil {
				log.Printf("[ERROR] Failed to upload file: %v. Error: %v", path, err)
				return nil
			}
		}
		return nil
	})

	log.Println("[INFO] Deployment completed successfully!")
	log.Printf("[INFO] Your site is live! View it here: %s", LIVE_URL)
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

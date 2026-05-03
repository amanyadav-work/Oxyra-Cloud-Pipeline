package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"gorm.io/driver/sqlite"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	ACCESSKEYID     = "005305f3eb765970000000003"              // Your Backblaze B2 Application Key ID
	SECRETACCESSKEY = "K005E0U9TM8/CJu9o2XZ3eI2WmW64B8"        // Your Backblaze B2 Application Key
	BUCKETNAME      = "vercel-clone2"                          // Your Backblaze B2 bucket name
	API_REGION      = "us-east-005"                            // Backblaze B2 region
	B2_ENDPOINT     = "https://s3.us-east-005.backblazeb2.com" // Your Backblaze B2 endpoint
)

const PORT = "8282"

func main() {
	DatabaseInit()
	router := gin.Default()
	router.Use(cors.Default())
	router.Any("/*filePath", proxyHandler)

	log.Println("Proxy server is running on port: ", PORT)
	if err := router.Run(":" + PORT); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}


type User struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name" binding:"required"`
	Email     string    `gorm:"unique;size:255;not null" json:"email" binding:"required,email"`
	Password  string    `gorm:"size:255;not null" json:"password" binding:"required"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type Project struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null" json:"user_id"`
	User        User       `gorm:"foreignKey:UserID" json:"user"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	URL         string    `gorm:"type:varchar(255);not null" json:"url"`
	Repo        string    `gorm:"type:varchar(255)" json:"repo"`
	LastUpdate  time.Time `gorm:"type:timestamp" json:"lastUpdate"`
	Branch      string    `gorm:"type:varchar(50)" json:"branch"`
	Status      string    `gorm:"type:varchar(50)" json:"status"`
	RootDir     string    `gorm:"type:varchar(255)" json:"rootDir"`
	BuildCmd    string    `gorm:"type:varchar(255)" json:"buildCmd"`
	OutputDir   string    `gorm:"type:varchar(255)" json:"outputDir"`
	InstallCmd  string    `gorm:"type:varchar(255)" json:"installCmd"`
	Subdomain   string    `gorm:"type:varchar(255)" json:"subdomain"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

var DB *gorm.DB

func DatabaseInit() {
	db, err := gorm.Open(sqlite.Open("../SQLite.DB"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
		panic(err)
	}

	DB = db
}

func proxyHandler(c *gin.Context) {
	// Extract the subdomain (part of the request host)
	parts := strings.Split(c.Request.Host, ".")
	var subdomain string
	if len(parts) > 0 {
		subdomain = parts[0]
	}

	if subdomain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subdomain is missing in the request"})
		return
	}

	var project Project
	if err := DB.Where("subdomain = ?", subdomain).First(&project).Error; err != nil {
		// If project is not found
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found for this subdomain"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error retrieving project: %v", err)})
		}
		return
	}

	filePath := c.Param("filePath")
	filePath = strings.TrimPrefix(filePath, "/")

	if filePath == "" {
		filePath = "index.html"
	}

	contentType, fileSize, fileContent, err := handleFileRequest(filePath, fmt.Sprintf("%d", project.ID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch file: %v", err)})
		return
	}
	defer fileContent.Close()

	// Set the correct content type and stream the file back to the client
	c.Header("Content-Type", contentType)
	c.Header("Content-Length", fmt.Sprintf("%d", fileSize))
	c.Header("Cache-Control", "max-age=3600")
	c.DataFromReader(http.StatusOK, -1, contentType, fileContent, map[string]string{})
}

func handleFileRequest(filePath string, projectID string) (string, int64, io.ReadCloser, error) {
	if filePath == "" {
		return "", 0, nil, fmt.Errorf("file path is required")
	}

	s3Key := fmt.Sprintf("__outputs/%v/%v", projectID, filePath)

	// Check file extension and set the correct Content-Type
	ext := filepath.Ext(filePath)
	var contentType string

	if ext == ".glb" {
		contentType = "model/gltf-binary"
	} else {
		contentType = mime.TypeByExtension(ext)
	}

	// Load AWS SDK config and fetch the file
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(API_REGION),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(ACCESSKEYID, SECRETACCESSKEY, "")),
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			if service == s3.ServiceID && region == API_REGION {
				return aws.Endpoint{
					URL: B2_ENDPOINT, // Backblaze B2 endpoint
				}, nil
			}
			return aws.Endpoint{}, fmt.Errorf("unknown endpoint for %s in %s", service, region)
		})))

	if err != nil {
		return "", 0, nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	s3Client := s3.NewFromConfig(cfg)

	req := &s3.GetObjectInput{
		Bucket: aws.String(BUCKETNAME),
		Key:    aws.String(s3Key),
	}

	resp, err := s3Client.GetObject(context.TODO(), req)
	if err != nil {
		return "", 0, nil, fmt.Errorf("failed to fetch file: %v", err)
	}

	// Extract the Content-Length from the response (if available)
	fileSize := int64(0)
	if resp.ContentLength != nil {
		fileSize = *resp.ContentLength
	}

	return contentType, fileSize, resp.Body, nil
}

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/segmentio/kafka-go"

	"github.com/jinzhu/gorm"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

const PORT = "8080"

func main() {
	router := gin.Default()

	db, err := gorm.Open("sqlite3", "./logs")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	defer db.Close()

	db.AutoMigrate(&Log{})

	kafka.NewReader(kafka.ReaderConfig{
		
	})
	
	go startKafkaConsumer()
	//Routes
	router.GET("/", handleHome)
	router.POST("/project", handleCreateProject)
	router.GET("/ws/logs/:projectID", handleLogsSocket)
	

	if err := router.Run(":" + PORT); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func handleHome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"Message": "True"})
}

type ProjectPayload struct {
	ProjectID string `json:"project_id"`
	GitUrl    string `json:"git_url"`
}

func handleCreateProject(c *gin.Context) {

	var payload ProjectPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiClient, err := client.New(client.WithHost("tcp://localhost:2375"))
	if err != nil {
		log.Fatal(err)
	}

	defer apiClient.Close()

	envVars := []string{
		fmt.Sprintf("PROJECT_ID=%v", payload.ProjectID),
		fmt.Sprintf("GIT_REPOSITORY__URL=%v", payload.GitUrl),
	}
	
	imageName := "wrongx/build-server-vercel"
	resp, err := apiClient.ContainerCreate(c, client.ContainerCreateOptions{
		Config: &container.Config{
			Image: imageName,
			Env:   envVars, // Set environment variables here
		},
		HostConfig: &container.HostConfig{
			AutoRemove: true,
		},
	})

	if _, err := apiClient.ContainerStart(c, resp.ID, client.ContainerStartOptions{}); err != nil {
		log.Fatal(err)
	}

	c.JSON(http.StatusOK, gin.H{"Message": fmt.Sprintf("Successfully started docker container: %v", resp.ID)})
}


var clients = make(map[string][]*websocket.Conn)
var clientsLock = sync.Mutex{}

type Log struct {
	ID        uint      `gorm:"primary_key"`
	ProjectID string    `gorm:"index"`  // Index for fast lookup by project ID
	Message   string    `gorm:"type:text"`
	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}



func handleLogsSocket(c *gin.Context) {
	// Get the project ID from the URL parameter
	projectID := c.Param("projectID")

	// Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade WebSocket connection:", err)
		return
	}
	defer conn.Close()

	// Add the WebSocket connection to the clients map for the project ID
	clientsLock.Lock()
	clients[projectID] = append(clients[projectID], conn)
	clientsLock.Unlock()

	// Keep the WebSocket open
	select {}
}



// Kafka Consumer function that consumes messages from Kafka and pushes to WebSocket clients
func startKafkaConsumer() {
	// Kafka Reader configuration
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{"localhost:9092"},
		Topic:    "logs",
		GroupID:  "log-consumer-group",
		Partition: kafka.PartitionAny,
	})

	// Poll messages from Kafka and filter by project ID
	for {
		// Read a message from Kafka
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Println("Error reading message from Kafka:", err)
			break
		}

		// Extract project ID from the key (assumed to be the project ID)
		projectID := string(msg.Key)
		logMessage := string(msg.Value)

		// Use the timestamp from the Kafka message (msg.Time)
		timestamp := msg.Time

		// Save the log to the database
		saveLogToDatabase(projectID, logMessage, timestamp)

		// Push log to all WebSocket clients
		pushLogToClients(projectID, logMessage, timestamp)
	}

	// Close the Kafka reader when done
	defer reader.Close()
}

func saveLogToDatabase(projectID, logMessage string, timestamp time.Time) {
	// Database connection
	db, err := gorm.Open("sqlite3", "./logs.db")
	if err != nil {
		log.Println("Failed to connect to database:", err)
		return
	}
	defer db.Close()

	// Insert log into database
	logEntry := Log{
		ProjectID: projectID,
		Message:   logMessage,
	}
	if err := db.Create(&logEntry).Error; err != nil {
		log.Println("Failed to save log to database:", err)
	}
}

func pushLogToClients(projectID, logMessage string) {
	// Lock to safely modify the clients map
	clientsLock.Lock()
	defer clientsLock.Unlock()

	// Get the WebSocket clients for the given project ID
	projectClients, exists := clients[projectID]
	if !exists {
		return // No clients are connected for this project
	}

	// Send the log message to each WebSocket client
	for _, client := range projectClients {
		err := client.WriteMessage(websocket.TextMessage, []byte(logMessage))
		if err != nil {
			log.Println("Error sending message to WebSocket:", err)
			client.Close() // Close the connection if there's an error
		}
	}
}
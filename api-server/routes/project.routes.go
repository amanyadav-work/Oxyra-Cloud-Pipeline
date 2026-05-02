package routes

import (
	"api-server/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

var clients = make(map[string][]*websocket.Conn)
var clientsLock = sync.Mutex{}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleCreateProject(c *gin.Context) {

	var payload models.ProjectPayload
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


func HandleLogsSocket(c *gin.Context) {
	projectID := c.Param("projectID")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade WebSocket connection:", err)
		return
	}
	defer conn.Close()

	clientsLock.Lock()
	clients[projectID] = append(clients[projectID], conn)
	clientsLock.Unlock()

	log.Printf("New WebSocket connection for project %s", projectID)

	select {}
}


func SaveLogToDatabase(logEntry models.Log) {
	if err := DB.Create(&logEntry).Error; err != nil {
		log.Println("Failed to save log to database:", err)
	}
}

func PushLogToClients(projectLog models.Log) {
	clientsLock.Lock()
	defer clientsLock.Unlock()

	projectClients, exists := clients[projectLog.ProjectID]
	if !exists {
		log.Printf("No clients found for projectID: %s", projectLog.ProjectID)
		return
	}
	b, err := json.Marshal(projectLog)
	if err != nil {
		log.Printf("Error Encoding Json: %s", err)
	}
	for _, client := range projectClients {
		err := client.WriteMessage(websocket.TextMessage, []byte(b))
		if err != nil {
			client.Close()
		}
	}
}
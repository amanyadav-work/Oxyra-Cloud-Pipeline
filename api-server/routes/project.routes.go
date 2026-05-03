package routes

import (
	api "api-server/APIs"
	"api-server/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"

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
	// Get the userID from the context set by the AuthMiddleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, formatError("UNAUTHORIZED", "User not authenticated", "Please login", "User authentication failed"))
		return
	}

	var payload models.ProjectPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, formatError("BAD_REQUEST", "Invalid JSON Payload", "Check the project data sent", err.Error()))
		return
	}

	var subdomain string
	if payload.Subdomain != "" {
		subdomain = payload.Subdomain
	} else {
		user := models.User{}
		if err := DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, formatError("USER_NOT_FOUND", "User not found", "Ensure user exists", "Unable to find the user"))
			return
		}

		emailPrefix := strings.Split(user.Email, "@")[0]
		subdomain = fmt.Sprintf("%s-%d", emailPrefix, time.Now().Unix())
	}

	project := models.Project{
		UserID:      userID.(uint),
		Name:        payload.Name,
		Description: payload.Description,
		Status:      "Active",
		URL:         fmt.Sprintf("%s.%s", subdomain, os.Getenv("DEPLOY_DOMAIN")),
		Repo:        payload.Repo,
		LastUpdate:  time.Now().UTC(),
		Branch:      payload.Branch,
		RootDir:     payload.RootDir,
		BuildCmd:    payload.BuildCmd,
		OutputDir:   payload.OutputDir,
		InstallCmd:  payload.InstallCmd,
		Subdomain:   subdomain,
		CreatedAt:   time.Now().UTC(),
	}

	if err := DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, formatError("DB_ERROR", "Error creating project", "Check the database connection", fmt.Sprintf("Error creating project: %v", err)))
		return
	}

	apiClient, err := client.New(client.WithHost("tcp://localhost:2375"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, formatError("DOCKER_CLIENT_ERROR", "Error connecting to Docker client", "Check Docker daemon connection", fmt.Sprintf("Error creating Docker client: %v", err)))
		return
	}
	defer apiClient.Close()

	envVars := []string{
		fmt.Sprintf("ACCESSKEYID=%v", os.Getenv("ACCESSKEYID")),
		fmt.Sprintf("SECRETACCESSKEY=%v", os.Getenv("SECRETACCESSKEY")),
		fmt.Sprintf("BUCKETNAME=%v", os.Getenv("BUCKETNAME")),
		fmt.Sprintf("PROJECT_ID=%v", project.ID),
		fmt.Sprintf("DEPLOY_DOMAIN=%v", os.Getenv("DEPLOY_DOMAIN")),
		fmt.Sprintf("B2_REGION=%v", os.Getenv("B2_REGION")),
		fmt.Sprintf("B2_ENDPOINT=%v", os.Getenv("B2_ENDPOINT")),

		// Include project-specific variables
		fmt.Sprintf("GIT_REPOSITORY__URL=%v", project.Repo),
		fmt.Sprintf("GIT_BRANCH=%v", project.Branch),
		fmt.Sprintf("SUBDOMAIN=%v", project.Subdomain),
		fmt.Sprintf("INSTALL_CMD=%v", project.InstallCmd),
		fmt.Sprintf("BUILD_CMD=%v", project.BuildCmd),
		fmt.Sprintf("OUTPUT_DIR=%v", project.OutputDir),
		fmt.Sprintf("GIT_ROOT_DIR=%v", project.RootDir),
	}

	imageName := "wrongx/build-server-vercel"
	resp, err := apiClient.ContainerCreate(c, client.ContainerCreateOptions{
		Config: &container.Config{
			Image: imageName,
			Env:   envVars,
		},
		HostConfig: &container.HostConfig{
			AutoRemove: true,
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, formatError("DOCKER_CREATE_ERROR", "Error creating Docker container", "Check Docker container creation", fmt.Sprintf("Error creating Docker container: %v", err)))
		return
	}

	if _, err := apiClient.ContainerStart(c, resp.ID, client.ContainerStartOptions{}); err != nil {
		c.JSON(http.StatusInternalServerError, formatError("DOCKER_START_ERROR", "Error starting Docker container", "Check Docker container startup", fmt.Sprintf("Error starting Docker container: %v", err)))
		return
	}

	c.JSON(http.StatusOK, gin.H{"Message": fmt.Sprintf("Successfully started deployment: %v", resp.ID), "project_id": project.ID})
}

func HandleGetAllProjects(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	query := c.DefaultQuery("query", "")
	var projects []models.Project

	queryStr := "%" + query + "%"
	err := DB.Model(&models.Project{}).
		Where("user_id = ?", userID).
		Where("name LIKE ? OR description LIKE ? OR status LIKE ? OR branch LIKE ? OR repo LIKE ? OR url LIKE ?",
			queryStr, queryStr, queryStr, queryStr, queryStr, queryStr).
		Find(&projects).Error

	if err != nil {
		errorResponse := formatError("db", "find failed", "projects", fmt.Sprintf("Error fetching projects: %v", err))
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func HandleGetAllLogs(c *gin.Context) {
	projectID := c.Param("projectID")

	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	var logs []models.Log

	err := DB.Model(&models.Log{}).
		Where("project_id = ?", projectID).
		Find(&logs).Error

	if err != nil {
		errorResponse := formatError("db", "find failed", "logs", fmt.Sprintf("Error fetching logs for projectID %s: %v", projectID, err))
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Return the logs as JSON
	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

func HandleGetProjectByID(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, formatError("UNAUTHORIZED", "User not authenticated", "Please login", "User authentication failed"))
		return
	}

	projectID := c.Param("projectID")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, formatError("BAD_REQUEST", "Project ID is required", "Provide a valid project ID", "Project ID is missing"))
		return
	}

	var project models.Project
	err := DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, formatError("PROJECT_NOT_FOUND", "Project not found", "Check the provided ID", "Project with given ID doesn't exist"))
		} else {
			c.JSON(http.StatusInternalServerError, formatError("DB_ERROR", "Error fetching project", "Check the database connection", fmt.Sprintf("Error fetching project: %v", err)))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"project": project,
	})
}

func HandleDeleteProject(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	projectID := c.Param("projectID")

	var project models.Project
	if err := DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, formatError("db", "project not found", "delete project", "Project not found or does not belong to user"))
		return
	}

	if err := DB.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, formatError("db", "delete failed", "delete project", "Error deleting project"))
		return
	}

	err := api.DeleteProjectFilesFromS3(projectID)
	if err != nil {
		log.Printf("[WARN] Failed to delete files from S3: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
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

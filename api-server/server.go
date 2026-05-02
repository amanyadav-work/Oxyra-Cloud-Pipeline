package main

import (
	"api-server/routes"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func startServer() {

	router := gin.Default()
	router.GET("/", handleHome)
	router.POST("/login", routes.HandleLogin)
	router.POST("/signup", routes.HandleSignup)
	router.POST("/project", routes.HandleCreateProject)
	router.GET("/ws/logs/:projectID", routes.HandleLogsSocket)
	router.GET("/logs", func(c *gin.Context) {
		c.File("./index.html")
	})

	if err := router.Run(":" + PORT); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}


func handleHome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"Health": "Working"})
}
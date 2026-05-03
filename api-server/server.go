package main

import (
	"api-server/routes"
	"log"
	"net/http"
	"os"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func startServer() {
	router := gin.Default()

	router.POST("/login", routes.HandleLogin)
	router.POST("/signup", routes.HandleSignup)
	router.POST("/logout", routes.HandleLogout)

	protected := router.Group("/")
	protected.Use(AuthMiddleware()) 

	// User Routes
	protected.GET("/user", routes.HandleGetUserByID)  
	protected.PATCH("/user", routes.HandleUpdateUser)  
	protected.DELETE("/user", routes.HandleDeleteUser)  


	// Project Routes
	protected.GET("/project", routes.HandleGetAllProjects)  
	protected.GET("/project/:projectID/logs", routes.HandleGetAllLogs)  
	protected.GET("/project/:projectID", routes.HandleGetProjectByID)  
	protected.DELETE("/project/:projectID", routes.HandleDeleteProject)  
	protected.POST("/project", routes.HandleCreateProject)  
	protected.GET("/ws/logs/:projectID", routes.HandleLogsSocket)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func handleHome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"Health": "Working"})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the token from the cookie
		tokenString, err := c.Cookie("authToken")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid auth token"})
			c.Abort()
			return
		}

		// Parse and validate the JWT token
		claims := &struct {
			UserID uint   `json:"user_id"`
			Email  string `json:"email"`
			jwt.StandardClaims
		}{}

		// Parse the JWT token and extract the claims
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired auth token"})
			c.Abort()
			return
		}

		// Set UserID and Email in the context for future use
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Next()
	}
}

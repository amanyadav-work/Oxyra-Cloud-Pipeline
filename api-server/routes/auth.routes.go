package routes

import (
	"api-server/models"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func HandleLogin(ctx *gin.Context) {
	var payload models.UserLogin

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": formatError("request", "invalid body", "form", "The request body cannot be parsed. Please ensure all fields are present and try again.")})
		return
	}

	payload.Email = strings.TrimSpace(payload.Email)
	payload.Password = strings.TrimSpace(payload.Password)

	var user models.User
	result := DB.Where("email = ?", payload.Email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": formatError("db", "query failed", "db", fmt.Sprintf("Error checking email existence: %v", result.Error))})
		return
	}

	err := checkPasswordHash(payload.Password, user.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := generateAuthToken(user, 120)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": formatError("server", "token generation failed", "toast", "Something went wrong while generating your token. Please try again.")})
		return
	}

	ctx.SetCookie("authToken", token, 120*60, "/", "", false, true)

	ctx.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": token, "user": user})
}

func HandleSignup(ctx *gin.Context) {

	var payload models.UserSignup

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": formatError("request", "invalid body", "form", "The request body cannot be parsed. Please ensure all fields are present and try again.")})
		return
	}

	payload.Name = strings.TrimSpace(payload.Name)
	payload.Email = strings.TrimSpace(payload.Email)
	payload.Password = strings.TrimSpace(payload.Password)

	result := DB.Where("email = ?", payload.Email).First(&models.User{})
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": formatError("request", "query failed", "db", fmt.Sprintf("Error checking email uniqueness: %v", result.Error))})
		return
	}

	// If the email already exists in the database, return a conflict error
	if result.Error == nil {
		ctx.JSON(http.StatusConflict, gin.H{"error": "Email must be unique. This email is already taken."})
		return
	}

	passwordHash, err := hashPassword(payload.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": formatError("server", "password hashing failed", "toast", "There has been an error checking your details. Please try again.")})
		return
	}

	user := models.User{
		Name:      payload.Name,
		Email:     payload.Email,
		Password:  passwordHash,
		CreatedAt: time.Now().UTC(),
	}

	if err := DB.Create(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": formatError("db", "create failed", "db", fmt.Sprintf("Error creating user: %v", err))})
		return
	}

	token, err := generateAuthToken(user, 120)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": formatError("server", "token generation failed", "toast", "Something went wrong while generating your verification email. Please try again.")})
		return
	}

	ctx.SetCookie("authToken", token, 120*60, "/", "", false, true)

	ctx.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "token": token, "user": user})
}

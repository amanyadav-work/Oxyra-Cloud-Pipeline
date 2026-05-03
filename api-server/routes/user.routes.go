package routes

import (
	"api-server/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func HandleGetUserByID(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func HandleUpdateUser(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var payload models.UserPasswordUpdate
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, formatError("validation", "invalid payload", "update user", "Invalid/Missing Details"))
		return
	}

	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, formatError("db", "user not found", "update user", "User not found"))
		return
	}

	err := checkPasswordHash(payload.OldPassword, user.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if payload.NewPassword != payload.ConfirmPassword {
		ctx.JSON(http.StatusBadRequest, formatError("validation", "password mismatch", "update user", "New password and confirm password do not match"))
		return
	}

	hashedPassword, err := hashPassword(payload.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, formatError("security", "password hashing failed", "update user", "Error hashing the new password"))
		return
	}

	user.Name = payload.Name
	user.Password = hashedPassword

	if err := DB.Save(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, formatError("db", "update failed", "update user", "Error updating user details"))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func HandleDeleteUser(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, formatError("db", "user not found", "delete user", "User not found"))
		return
	}

	if err := DB.Where("user_id = ?", userID).Delete(&models.Project{}).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, formatError("db", "delete failed", "delete user projects", "Error deleting user projects"))
		return
	}

	if err := DB.Delete(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, formatError("db", "delete failed", "delete user", "Error deleting user"))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User and all associated projects deleted successfully"})
}

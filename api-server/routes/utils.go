package routes

import (
	"api-server/models"
	"fmt"
	"os"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func formatError(code, title, action, message string) gin.H {
	return gin.H{
		"type":     code,
		"code":     title,
		"severity": "error",
		"action":   action,
		"message":  message,
	}
}

func hashPassword(password string) (string, error) {

	var passwordBytes = []byte(password)
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.MinCost) // Hash password with bcrypt's min cost

	return string(hashedPasswordBytes), err
}

func generateAuthToken(user models.User, minutes int) (string, error) {

	type signedDetails struct {
		UserID uint   `json:"user_id"` 
		Email  string `json:"email"`   
		jwt.StandardClaims
	}

	// Create the claims
	claims := &signedDetails{
		UserID: user.ID, 
		Email:  user.Email,  
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().UTC().Add(time.Minute * time.Duration(minutes)).Unix(), 
		},
	}

	// Generate the token with claims
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(os.Getenv("JWT_SECRET")))
	return token, err
}



func checkPasswordHash(password, hashedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return fmt.Errorf("password does not match")
	}
	return nil
}

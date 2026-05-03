package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name" binding:"required"`
	Email     string    `gorm:"unique;size:255;not null" json:"email" binding:"required,email"`
	Password  string    `gorm:"size:255;not null" json:"password" binding:"required"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}


type UserLogin struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"remember_me"`
}

type UserSignup struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserPasswordUpdate struct {
	Name            string `json:"name" binding:"required"`
	OldPassword     string `json:"old_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}
package routes

import (
	"api-server/models"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func DatabaseInit() {
	// Open the database connection
	db, err := gorm.Open(sqlite.Open("./logs.DB"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
		panic(err)
	}

	DB = db

	// Migrate all necessary models (Log, Project, User)
	err = DB.AutoMigrate(&models.Log{}, &models.Project{}, &models.User{})
	if err != nil {
		log.Fatal("Error migrating tables:", err)
	}

	log.Println("Database initialized and migrations applied")
}


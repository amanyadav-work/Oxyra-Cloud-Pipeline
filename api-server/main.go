package main

import (
	api "api-server/APIs"
	"api-server/models"
	routes "api-server/routes"
	"log"

	"github.com/joho/godotenv"
)

const PORT = "8080"

func main() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Println("Error loading .env file")
	}

	routes.DatabaseInit()
	go api.StartKafkaConsumer(func(log models.Log) {
		routes.SaveLogToDatabase(log)
		routes.PushLogToClients(log)
	})
	
	startServer()
	// ticker := time.NewTicker(5 * time.Second)
	// defer ticker.Stop()

	// go func() {
	// 	for range ticker.C {
	// 		projectLog := Log{
	// 			ID: 123,
	// 			ProjectID: "portfolio",
	// 			Message: "Log message from project123 at ",
	// 			Timestamp: time.Now(),
	// 		}
	// 		pushLogToClients(projectLog)
	// 	}
	// }()
}

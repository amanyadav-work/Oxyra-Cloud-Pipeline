package api

import (
	"api-server/models"
	// // "api-server/routes"
	"context"
	"log"

	"github.com/segmentio/kafka-go"
)

func StartKafkaConsumer(callback func(log models.Log)) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9093"},
		Topic:   "logs",
		GroupID: "log-consumer-group",
	})

	defer reader.Close()
	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Println("Error reading message from Kafka:", err)
			break
		}

		log := models.Log{
			ProjectID: string(msg.Key),
			Message:   string(msg.Value),
			Timestamp: msg.Time,
		}
		callback(log)
	}

}

package models

import "time"

type ProjectPayload struct {
	ProjectID string `json:"project_id"`
	GitUrl    string `json:"git_url"`
}

type Log struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	ProjectID string    `gorm:"index" json:"project_id"`
	Message   string    `gorm:"type:text" json:"message"`
	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"timestamp"`
}

type Project struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string  
	Description string
}
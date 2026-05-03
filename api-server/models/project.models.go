package models

import "time"

type ProjectPayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	URL         string `json:"url"`
	Repo        string `json:"repo"`
	LastUpdate  string `json:"lastUpdate"`
	Branch      string `json:"branch"`
	Status      string `json:"status"`
	RootDir     string `json:"rootDir"`
	BuildCmd    string `json:"buildCmd"`
	OutputDir   string `json:"outputDir"`
	InstallCmd  string `json:"installCmd"`
	Subdomain   string    `gorm:"type:varchar(255)" json:"subdomain"`
}

type Log struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	ProjectID string    `gorm:"index" json:"project_id"`
	Message   string    `gorm:"type:text" json:"message"`
	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"timestamp"`
}


type Project struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null" json:"user_id"` 
	User        User      `gorm:"foreignKey:UserID" json:"user"` 
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	URL         string    `gorm:"type:varchar(255);not null" json:"url"`
	Repo        string    `gorm:"type:varchar(255)" json:"repo"`
	Branch      string    `gorm:"type:varchar(50)" json:"branch"`
	LastUpdate  time.Time `gorm:"type:timestamp" json:"lastUpdate"`
	Status      string    `gorm:"type:varchar(50)" json:"status"`
	RootDir     string    `gorm:"type:varchar(255)" json:"rootDir"`
	BuildCmd    string    `gorm:"type:varchar(255)" json:"buildCmd"`
	OutputDir   string    `gorm:"type:varchar(255)" json:"outputDir"`
	InstallCmd  string    `gorm:"type:varchar(255)" json:"installCmd"`
	Subdomain   string    `gorm:"type:varchar(255)" json:"subdomain"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "db_username" {
  description = "The database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The database password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "node_count" {
  description = "The number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "machine_type" {
  description = "The machine type for GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "disk_size_gb" {
  description = "The disk size for GKE nodes in GB"
  type        = number
  default     = 100
}

variable "min_node_count" {
  description = "The minimum number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "max_node_count" {
  description = "The maximum number of nodes in the GKE cluster"
  type        = number
  default     = 10
}

variable "db_tier" {
  description = "The Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "backup_retention_days" {
  description = "The number of days to retain backups"
  type        = number
  default     = 30
} 
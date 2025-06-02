provider "google" {
  project = var.project_id
  region  = var.region
}

# Create GKE cluster
resource "google_container_cluster" "primary" {
  name     = "task-management-cluster"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable workload identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enable IP aliasing
  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "10.0.0.0/16"
    services_ipv4_cidr_block = "10.1.0.0/16"
  }

  # Enable private cluster
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Enable release channel
  release_channel {
    channel = "REGULAR"
  }

  # Enable maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }
}

# Create node pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "task-management-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 3

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only",
    ]

    labels = {
      env = "production"
    }

    machine_type = "e2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-standard"

    # Enable workload identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }

  autoscaling {
    min_node_count = 3
    max_node_count = 10
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# Create VPC network
resource "google_compute_network" "vpc" {
  name                    = "task-management-vpc"
  auto_create_subnetworks = false
}

# Create subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "task-management-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.vpc.name
  region        = var.region

  private_ip_google_access = true
}

# Create Cloud SQL instance
resource "google_sql_database_instance" "postgres" {
  name             = "task-management-postgres"
  database_version = "POSTGRES_13"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    backup_configuration {
      enabled = true
    }

    ip_configuration {
      private_network = google_compute_network.vpc.id
    }
  }
}

# Create database
resource "google_sql_database" "database" {
  name     = "task_management"
  instance = google_sql_database_instance.postgres.name
}

# Create database user
resource "google_sql_user" "user" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Create Cloud Storage bucket for backups
resource "google_storage_bucket" "backups" {
  name          = "task-management-backups"
  location      = var.region
  force_destroy = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Create IAM service account for GKE
resource "google_service_account" "gke_sa" {
  account_id   = "task-management-gke-sa"
  display_name = "Task Management GKE Service Account"
}

# Grant necessary permissions to the service account
resource "google_project_iam_member" "gke_sa_roles" {
  for_each = toset([
    "roles/container.admin",
    "roles/storage.admin",
    "roles/monitoring.admin",
    "roles/logging.admin"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
} 
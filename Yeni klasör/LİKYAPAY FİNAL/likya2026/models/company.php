<?php
// Company Model
// Path: models/company.php

// include_once '../core/database.php'; // Included by controller/api usually

class Company {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $tax_number;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    // GET ALL USERS (Except Admin)
    public function read() {
        // Debug mode: Fetch ALL users to see if role filtering is the issue
        $query = "SELECT id, name, email, tax_id, phone, status, role, created_at FROM users ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // CREATE USER
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET name=:name, email=:email, password_hash=:password_hash, tax_number=:tax_number, role='user'";
        
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->tax_number = htmlspecialchars(strip_tags($this->tax_number));
        
        // Hash Password
        $password_hash = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":tax_number", $this->tax_number);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // DELETE USER
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        if($stmt->execute()) return true;
        return false;
    }
}
?>

<?php
// Core Database Connection
// Path: core/database.php

class Database {
    private $host = "localhost";
    private $db_name = "likyapay";
    private $username = "root";
    private $password = ""; // XAMPP default is empty
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // If database not found, try to connect without dbname to Create it
            if ($exception->getCode() == 1049) {
                 return null; // DB does not exist
            }
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>

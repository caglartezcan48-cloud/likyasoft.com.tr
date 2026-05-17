<?php
/**
 * MAZELLO LIGHTWEIGHT SMTP MAILER
 * dependency-free, simple socket based SMTP client
 */

class SmtpMailer
{
    private $host;
    private $port;
    private $user;
    private $pass;
    private $debug = false;
    private $conn;

    public function __construct($host, $port, $user, $pass)
    {
        $this->host = $host;
        $this->port = $port;
        $this->user = $user;
        $this->pass = $pass;
    }

    public function send($to, $subject, $body, $fromName = "Mazello Mobilya")
    {
        try {
            // 1. Connect
            $socket = fsockopen(($this->port == 465 ? "ssl://" : "") . $this->host, $this->port, $errno, $errstr, 10);
            if (!$socket)
                throw new Exception("Connection failed: $errstr");
            $this->conn = $socket;

            $this->response(); // Greeting
            $this->cmd("EHLO " . $_SERVER['SERVER_NAME']);

            // 2. Auth
            $this->cmd("AUTH LOGIN");
            $this->cmd(base64_encode($this->user));
            $this->cmd(base64_encode($this->pass));

            // 3. Mail Info
            $this->cmd("MAIL FROM: <" . $this->user . ">");
            $this->cmd("RCPT TO: <$to>");
            $this->cmd("DATA");

            // 4. Content
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-type: text/html; charset=UTF-8\r\n";
            $headers .= "From: $fromName <" . $this->user . ">\r\n";
            $headers .= "To: $to\r\n";
            $headers .= "Subject: $subject\r\n";

            $content = $headers . "\r\n" . $body . "\r\n.\r\n";
            $this->cmd($content, false); // Don't verify response code for data content rigorously, just check success

            // 5. Quit
            $this->cmd("QUIT");
            fclose($this->conn);

            return true;
        } catch (Exception $e) {
            if ($this->conn)
                fclose($this->conn);
            return "Error: " . $e->getMessage();
        }
    }

    private function cmd($cmd, $check = true)
    {
        fputs($this->conn, $cmd . "\r\n");
        if ($check)
            $this->response();
    }

    private function response()
    {
        $res = "";
        while (substr($res, 3, 1) != " ") {
            $res = fgets($this->conn, 512);
        }
        // Basic check: 4xx or 5xx means error
        $code = substr($res, 0, 3);
        if ($code >= 400)
            throw new Exception("SMTP Error: $res");
    }
}
?>
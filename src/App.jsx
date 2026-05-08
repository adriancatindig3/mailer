import { useState } from "react";

export default function App() {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendEmail = async () => {
    setStatus("Sending...");

    try {
      const res = await fetch("/.netlify/functions/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipient,
          message
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Email sent successfully!");
        setRecipient("");
        setMessage("");
      } else {
        setStatus(data.error || "Failed to send email");
      }

    } catch (err) {
      setStatus("Error sending email");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2>Send Email</h2>

      <input
        type="email"
        placeholder="Recipient email"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", height: "120px", padding: "10px", marginBottom: "10px" }}
      />

      <button
        onClick={sendEmail}
        style={{ width: "100%", padding: "10px", cursor: "pointer" }}
      >
        Send Email
      </button>

      <p>{status}</p>
    </div>
  );
}
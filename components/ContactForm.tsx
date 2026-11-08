"use client";

import { useEffect, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const message = (formData.get("message") as string)?.trim() || "";

    const subject = encodeURIComponent(`Project Inquiry from ${name}`);
    const bodyContent = encodeURIComponent(
      `Hi Dev,\n\n${message}\n\nSender: ${name}\nEmail: ${email}`
    );

    const mailtoUrl = `mailto:bitzzdev@gmail.com?subject=${subject}&body=${bodyContent}`;

    window.location.href = mailtoUrl;
    setStatus("success");
    form.reset();
  };

  return (
    <form className="am-form" onSubmit={handleSubmit}>
      <div className="am-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          className="am-input"
          placeholder="Ada Lovelace"
          required
        />
      </div>

      <div className="am-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          className="am-input"
          placeholder="ada@domain.io"
          required
        />
      </div>

      <div className="am-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          className="am-input"
          rows={4}
          placeholder="Describe your project, timeline, or engineering inquiry..."
          required
        />
      </div>

      <button type="submit" className="am-submit">
        {status === "success" ? "Dispatched" : "Transmit inquiry"}
      </button>
    </form>
  );
}

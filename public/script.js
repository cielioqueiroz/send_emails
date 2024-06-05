document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("email-form");
  const yearSpan = document.getElementById("year");

  
  const currentYear = new Date().getFullYear();
  yearSpan.textContent = currentYear;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const sender = document.getElementById("sender-input").value;
    const recipient = document.getElementById("recipient-input").value;
    const subject = document.getElementById("subject-input").value;
    const message = document.getElementById("message-input").value;

    if (!sender || !recipient || !subject || !message) {
      Toastify({
        text: "Todos os campos são obrigatórios.",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000
      }).showToast();
      return;
    }

    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender,
          recipient,
          subject,
          message,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Toastify({
          text: "Email enviado com sucesso!",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          duration: 3000
        }).showToast();
        form.reset();
      } else {
        Toastify({
          text: `Erro ao enviar o email: ${result.error}`,
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          duration: 3000
        }).showToast();
      }
    } catch (error) {
      console.error("Erro ao enviar o email: ", error);
      Toastify({
        text: "Erro ao enviar o email. Por favor, tente novamente.",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000
      }).showToast();
    }
  });
});

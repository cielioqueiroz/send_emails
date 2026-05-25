document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('email-form');
  const button = document.getElementById('send-button');
  const yearSpan = document.getElementById('year');

  const recipient = document.getElementById('recipient-input');
  const subject = document.getElementById('subject-input');
  const message = document.getElementById('message-input');

  const subjectCount = document.getElementById('subject-count');
  const messageCount = document.getElementById('message-count');

  yearSpan.textContent = new Date().getFullYear();

  const bindCounter = (input, output) => {
    const update = () => { output.textContent = input.value.length; };
    input.addEventListener('input', update);
    update();
  };
  bindCounter(subject, subjectCount);
  bindCounter(message, messageCount);

  const toast = (icon, title) => {
    if (typeof Swal === 'undefined') return alert(title);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
    });
  };

  const setLoading = (loading) => {
    button.disabled = loading;
    button.classList.toggle('loading', loading);
  };

  const markInvalid = (el) => {
    el.classList.add('invalid');
    el.addEventListener('input', () => el.classList.remove('invalid'), { once: true });
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = {
      recipient: recipient.value.trim(),
      subject: subject.value.trim(),
      message: message.value.trim(),
    };

    if (!data.recipient || !isValidEmail(data.recipient)) {
      markInvalid(recipient);
      return toast('error', 'Informe um e-mail de destinatário válido.');
    }
    if (!data.subject) {
      markInvalid(subject);
      return toast('error', 'O assunto é obrigatório.');
    }
    if (!data.message) {
      markInvalid(message);
      return toast('error', 'A mensagem é obrigatória.');
    }

    setLoading(true);
    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        toast('success', result.message || 'E-mail enviado com sucesso!');
        form.reset();
        subjectCount.textContent = '0';
        messageCount.textContent = '0';
      } else if (response.status === 429) {
        toast('warning', result.error || 'Muitas tentativas. Aguarde alguns minutos.');
      } else {
        toast('error', result.error || 'Erro ao enviar o e-mail.');
      }
    } catch (error) {
      console.error('Falha na requisição:', error);
      toast('error', 'Erro de conexão. Verifique sua rede e tente novamente.');
    } finally {
      setLoading(false);
    }
  });
});

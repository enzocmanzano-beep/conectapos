const dialog = document.querySelector('#ticketDialog');
const toast = document.querySelector('#toast');
const ticketList = document.querySelector('#ticketList');
const openCount = document.querySelector('#openCount');
const ticketBadge = document.querySelector('#ticketBadge');

const savedTickets = JSON.parse(localStorage.getItem('conectaposTickets') || '[]');
const hiddenDemoTickets = JSON.parse(localStorage.getItem('conectaposHiddenDemoTickets') || '[]');

function safeText(value) {
  return String(value).replace(/[<>]/g, '');
}

function ticketHtml(ticket) {
  return `<span class="ticket-type technical">▤</span>
    <div class="ticket-main">
      <div class="ticket-title">
        <strong>${safeText(ticket.subject)}</strong>
        <span class="pill open">Aberto</span>
      </div>
      <p>Protocolo #CP-2026-${ticket.number} · ${safeText(ticket.type)}</p>
      <div class="sla"><span><i style="width:10%"></i></span><small>SLA: 24h restantes</small></div>
    </div>
    <div class="ticket-side">
      <small>Agora</small>
      <button class="delete-ticket" type="button" aria-label="Excluir chamado" title="Excluir chamado">🗑</button>
      <b>›</b>
    </div>`;
}

function addDeleteButton(item) {
  const side = item.querySelector('.ticket-side');
  if (!side || side.querySelector('.delete-ticket')) return;
  const button = document.createElement('button');
  button.className = 'delete-ticket';
  button.type = 'button';
  button.setAttribute('aria-label', 'Excluir chamado');
  button.title = 'Excluir chamado';
  button.textContent = '🗑';
  side.insertBefore(button, side.querySelector('b'));
}

function updateCounts() {
  const tickets = [...ticketList.querySelectorAll('.ticket')];
  const opened = tickets.filter(ticket => ticket.dataset.status === 'Aberto').length;
  openCount.textContent = opened;
  ticketBadge.textContent = tickets.length;
}

[...ticketList.querySelectorAll('.ticket')].forEach((item, index) => {
  item.dataset.ticketId = `demo-${index + 1}`;
  item.dataset.ticketSource = 'demo';
  if (hiddenDemoTickets.includes(item.dataset.ticketId)) {
    item.remove();
  } else {
    addDeleteButton(item);
  }
});

savedTickets.forEach((ticket, index) => {
  if (!ticket.id) ticket.id = `saved-${ticket.number}-${index}`;
});
localStorage.setItem('conectaposTickets', JSON.stringify(savedTickets));

savedTickets.slice().reverse().forEach(ticket => {
  const item = document.createElement('article');
  item.className = 'ticket';
  item.dataset.status = 'Aberto';
  item.dataset.ticketId = ticket.id;
  item.dataset.ticketSource = 'saved';
  item.innerHTML = ticketHtml(ticket);
  ticketList.prepend(item);
});

updateCounts();

document.querySelector('#openTicket').addEventListener('click', () => dialog.showModal());
document.querySelector('.close').addEventListener('click', () => dialog.close());
document.querySelector('.close-action').addEventListener('click', () => dialog.close());

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

document.querySelector('#ticketForm').addEventListener('submit', event => {
  event.preventDefault();
  const subject = document.querySelector('#ticketSubject').value.trim();
  const type = document.querySelector('#ticketType').value;

  if (!subject || !type) {
    showToast('Preencha os campos obrigatórios.');
    return;
  }

  const number = Math.floor(1000 + Math.random() * 8999);
  const ticket = {
    id: `saved-${number}-${Date.now()}`,
    subject,
    type,
    number
  };

  const item = document.createElement('article');
  item.className = 'ticket';
  item.dataset.status = 'Aberto';
  item.dataset.ticketId = ticket.id;
  item.dataset.ticketSource = 'saved';
  item.innerHTML = ticketHtml(ticket);
  ticketList.prepend(item);

  savedTickets.push(ticket);
  localStorage.setItem('conectaposTickets', JSON.stringify(savedTickets));
  updateCounts();
  dialog.close();
  event.target.reset();
  showToast(`Chamado aberto! Protocolo #CP-2026-${number}`);
});

ticketList.addEventListener('click', event => {
  const button = event.target.closest('.delete-ticket');
  if (!button) return;

  event.stopPropagation();
  const item = button.closest('.ticket');
  const subject = item.querySelector('.ticket-title strong')?.textContent || 'este chamado';

  if (!window.confirm(`Deseja realmente excluir o chamado "${subject}"?`)) return;

  if (item.dataset.ticketSource === 'saved') {
    const index = savedTickets.findIndex(ticket => ticket.id === item.dataset.ticketId);
    if (index >= 0) savedTickets.splice(index, 1);
    localStorage.setItem('conectaposTickets', JSON.stringify(savedTickets));
  } else {
    if (!hiddenDemoTickets.includes(item.dataset.ticketId)) {
      hiddenDemoTickets.push(item.dataset.ticketId);
    }
    localStorage.setItem('conectaposHiddenDemoTickets', JSON.stringify(hiddenDemoTickets));
  }

  item.remove();
  updateCounts();
  showToast('Chamado excluído com sucesso.');
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.ticket').forEach(ticket => {
    ticket.style.display = button.dataset.filter === 'Todos' || ticket.dataset.status === button.dataset.filter ? 'grid' : 'none';
  });
}));

const chat = document.querySelector('#chatPanel');
document.querySelector('#chatButton').addEventListener('click', () => {
  chat.classList.add('open');
  chat.setAttribute('aria-hidden', 'false');
});
document.querySelector('#closeChat').addEventListener('click', () => {
  chat.classList.remove('open');
  chat.setAttribute('aria-hidden', 'true');
});
document.querySelectorAll('.suggestions button').forEach(button => button.addEventListener('click', () => showToast('Opção selecionada: ' + button.textContent)));
document.querySelectorAll('[data-help]').forEach(button => button.addEventListener('click', () => showToast('Conteúdo de ajuda aberto.')));
document.querySelector('.see-all').addEventListener('click', () => showToast('Você já está vendo os chamados mais recentes.'));

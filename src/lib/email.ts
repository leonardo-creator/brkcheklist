/**
 * Serviço de envio de emails via Power Automate Webhook
 */

interface EmailPayload {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  bodyHtml: string;
  attachmentName?: string;
  attachmentContent?: string;
  metadata?: Record<string, unknown>;
}

interface InspectionEmailData {
  inspectionNumber: number;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: Date;
  submittedAt?: Date;
  location?: string;
  pdfLink?: string;
  oneDriveLink?: string;
  nonCompliances: string[];
}

/**
 * Envia email de notificação de inspeção concluída
 */
export async function sendInspectionEmail(
  data: InspectionEmailData
): Promise<{ status: string }> {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  const ccEmail = process.env.EMAIL_CC;
  const emailSubject = process.env.EMAIL_SUBJECT;

  if (!webhookUrl) {
    throw new Error('POWER_AUTOMATE_WEBHOOK_URL não configurada');
  }

  const bodyLines = [
    'Olá,',
    '',
    `Uma nova inspeção de segurança foi registrada no sistema.`,
    '',
    '=== DADOS DA INSPEÇÃO ===',
    `Número: #${data.inspectionNumber}`,
    `Responsável: ${data.userName} (${data.userEmail})`,
    `Status: ${data.status}`,
    `Data de Criação: ${data.createdAt.toLocaleString('pt-BR')}`,
    data.submittedAt
      ? `Data de Envio: ${data.submittedAt.toLocaleString('pt-BR')}`
      : '',
    data.location ? `Local: ${data.location}` : '',
    '',
  ];

  if (data.nonCompliances.length > 0) {
    bodyLines.push('⚠️ NÃO CONFORMIDADES IDENTIFICADAS:');
    data.nonCompliances.forEach((nc) => bodyLines.push(`  • ${nc}`));
    bodyLines.push('');
  }

  if (data.pdfLink) {
    bodyLines.push('📄 Relatório PDF:');
    bodyLines.push(data.pdfLink);
    bodyLines.push('');
  }

  if (data.oneDriveLink) {
    bodyLines.push('📁 Pasta OneDrive com evidências:');
    bodyLines.push(data.oneDriveLink);
    bodyLines.push('');
  }

  bodyLines.push('---');
  bodyLines.push(
    'Esta é uma mensagem automática do Sistema de Inspeção BRK.'
  );

  const payload: EmailPayload = {
    to: data.userEmail,
    cc: ccEmail,
    subject: `${emailSubject} #${data.inspectionNumber}`,
    body: bodyLines.filter(Boolean).join('\r\n'),
    bodyHtml: buildHtmlEmail(data),
    metadata: {
      origem: 'brk-checklist-system',
      inspectionNumber: data.inspectionNumber,
      enviadoEm: new Date().toISOString(),
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Webhook retornou status ${response.status}: ${errorText}`
      );
    }

    return { status: 'ok' };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Constrói HTML do email
 */
function buildHtmlEmail(data: InspectionEmailData): string {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const ncHtml =
    data.nonCompliances.length > 0
      ? `
    <div style="background:#fee;border-left:4px solid #c00;padding:12px;margin:16px 0">
      <h3 style="margin:0 0 8px 0;color:#c00">⚠️ Não Conformidades Identificadas</h3>
      <ul style="margin:0;padding-left:20px">
        ${data.nonCompliances.map((nc) => `<li>${escapeHtml(nc)}</li>`).join('')}
      </ul>
    </div>
  `
      : '';

  const linksHtml = `
    ${data.pdfLink ? `<p><strong>📄 Relatório PDF:</strong><br><a href="${data.pdfLink}" style="color:#0066cc">${data.pdfLink}</a></p>` : ''}
    ${data.oneDriveLink ? `<p><strong>📁 Pasta OneDrive:</strong><br><a href="${data.oneDriveLink}" style="color:#0066cc">${data.oneDriveLink}</a></p>` : ''}
  `;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:Arial,sans-serif;color:#1f1f1f;line-height:1.6;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#0066cc;color:#fff;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:24px">Inspeção de Segurança #${data.inspectionNumber}</h1>
  </div>
  
  <div style="border:1px solid #ddd;border-top:none;padding:20px;border-radius:0 0 8px 8px">
    <p>Olá,</p>
    <p>Uma nova inspeção de segurança foi registrada no sistema.</p>
    
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr style="background:#f5f5f5">
        <td style="padding:8px;border:1px solid #ddd"><strong>Número</strong></td>
        <td style="padding:8px;border:1px solid #ddd">#${data.inspectionNumber}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>Responsável</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.userName)}</td>
      </tr>
      <tr style="background:#f5f5f5">
        <td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.userEmail)}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>Status</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.status)}</td>
      </tr>
      <tr style="background:#f5f5f5">
        <td style="padding:8px;border:1px solid #ddd"><strong>Data</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${data.createdAt.toLocaleString('pt-BR')}</td>
      </tr>
      ${data.location ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Local</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.location)}</td></tr>` : ''}
    </table>
    
    ${ncHtml}
    ${linksHtml}
    
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
    <p style="font-size:12px;color:#666">Esta é uma mensagem automática do Sistema de Inspeção BRK.</p>
  </div>
</body>
</html>`;
}

/**
 * Envia notificação de edição pós-submissão para admin
 */
export async function sendEditNotificationToAdmin(
  inspectionNumber: number,
  userName: string,
  userEmail: string,
  changes: string[]
): Promise<{ status: string }> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;

  if (!webhookUrl || !adminEmail) {
    throw new Error('Configurações de email não encontradas');
  }

  const bodyLines = [
    'Olá Admin,',
    '',
    `A inspeção #${inspectionNumber} foi EDITADA após ser enviada.`,
    '',
    `Usuário: ${userName} (${userEmail})`,
    `Data da edição: ${new Date().toLocaleString('pt-BR')}`,
    '',
    'Alterações realizadas:',
    ...changes.map((c) => `  • ${c}`),
    '',
    'Acesse o sistema para revisar as mudanças.',
  ];

  const payload: EmailPayload = {
    to: adminEmail,
    subject: `⚠️ Inspeção #${inspectionNumber} foi editada após envio`,
    body: bodyLines.join('\r\n'),
    bodyHtml: buildEditNotificationHtml(
      inspectionNumber,
      userName,
      userEmail,
      changes
    ),
    metadata: {
      type: 'edit-notification',
      inspectionNumber,
    },
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar notificação de edição');
  }

  return { status: 'ok' };
}

function buildEditNotificationHtml(
  inspectionNumber: number,
  userName: string,
  userEmail: string,
  changes: string[]
): string {
  return `<!doctype html>
<html lang="pt-BR">
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#ff9800;color:#fff;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0">⚠️ Inspeção Editada</h1>
  </div>
  <div style="border:1px solid #ddd;border-top:none;padding:20px">
    <p>A inspeção <strong>#${inspectionNumber}</strong> foi editada após ser enviada.</p>
    <p><strong>Usuário:</strong> ${userName} (${userEmail})<br>
    <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    <h3>Alterações:</h3>
    <ul>${changes.map((c) => `<li>${c}</li>`).join('')}</ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inspections/${inspectionNumber}" style="background:#0066cc;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:16px">Revisar Inspeção</a></p>
  </div>
</body>
</html>`;
}

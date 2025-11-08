async function executeAIPrompt() {
  const prompt = document.getElementById('aiPrompt').value;
  const responseDiv = document.getElementById('aiResponse');
  if (!prompt.trim()) {
    alert('Enter command');
    return;
  }
  responseDiv.innerHTML = '<div class="spinner-border"></div> Processing...';
  try {
    const response = await fetch('/api/ai/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const result = await response.json();
    if (result.success) {
      responseDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
      updateCallStats();
    } else {
      responseDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
    }
  } catch (error) {
    responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
  }
}

async function uploadNumbers() {
  const numbers = document.getElementById('phoneNumbers').value;
  if (!numbers.trim()) { alert('Enter numbers'); return; }
  try {
    const response = await fetch('/api/dialer/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numbers })
    });
    const result = await response.json();
    alert(result.success ? result.message : result.message);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function startCalling() {
  const numbers = document.getElementById('phoneNumbers').value;
  const message = document.getElementById('callMessage').value;
  const useAI = document.getElementById('useAI').checked;
  const phoneNumbers = numbers.split(/[\n,]+/).map(n => n.trim()).filter(n => n);
  if (phoneNumbers.length === 0) { alert('No numbers'); return; }
  if (!confirm(`Call ${phoneNumbers.length} numbers?`)) return;
  try {
    const response = await fetch('/api/dialer/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumbers, message, useAI })
    });
    const result = await response.json();
    alert(result.success ? 'Started: ' + result.message : result.message);
    setTimeout(updateCallStats, 2000);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function updateCallStats() {
  try {
    const response = await fetch('/api/dialer/logs');
    const result = await response.json();
    if (result.success && result.data.stats) {
      const stats = result.data.stats;
      document.getElementById('totalCalls').textContent = stats.total || 0;
      document.getElementById('completedCalls').textContent = stats.completed || 0;
      document.getElementById('failedCalls').textContent = stats.failed || 0;
      document.getElementById('successRate').textContent = stats.successRate || 0;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
document.addEventListener('DOMContentLoaded', updateCallStats);
setInterval(updateCallStats, 10000);

async function generateSingle() {
  const title = document.getElementById('title').value;
  const details = document.getElementById('details').value;
  const resultDiv = document.getElementById('result');
  if (!title.trim()) { alert('Enter title'); return; }
  resultDiv.innerHTML = `<div class="alert alert-info">
    <div class="spinner-border spinner-border-sm me-2"></div>
    Generating <strong>${title}</strong>...
  </div>`;
  try {
    const response = await fetch('/blog/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, details })
    });
    const result = await response.json();
    if (result.success) {
      resultDiv.innerHTML = `<div class="alert alert-success">
        <h5>Generated!</h5>
        <a href="/blog/${result.data.slug}" class="btn btn-primary" target="_blank">View</a>
      </div>`;
      document.getElementById('title').value = '';
      document.getElementById('details').value = '';
    } else {
      resultDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function generateBulk() {
  const bulkTitles = document.getElementById('bulkTitles').value;
  const resultDiv = document.getElementById('result');
  const titles = bulkTitles.split(/\n/).map(t => t.trim()).filter(t => t);
  if (titles.length === 0) { alert('Enter titles'); return; }
  if (!confirm(`Generate ${titles.length} articles?`)) return;
  resultDiv.innerHTML = `<div class="alert alert-info">Generating ${titles.length} articles...</div>`;
  const articles = titles.map(title => ({ title }));
  try {
    const response = await fetch('/blog/bulk-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles })
    });
    const result = await response.json();
    if (result.success) {
      let html = `<div class="alert alert-success">
        <h5>Complete!</h5><p>Generated ${result.data.generated.length}</p>`;
      if (result.data.generated.length > 0) {
        html += `<h6>Articles</h6><ul class="list-group">`;
        result.data.generated.forEach(blog => {
          html += `<li class="list-group-item">${blog.title} <a href="/blog/${blog.blog.slug}" target="_blank">View</a></li>`;
        });
        html += "</ul>";
      }
      html += `</div>`;
      resultDiv.innerHTML = html;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

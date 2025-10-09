// js/app.js — frontend logic for search + Ask AI
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('results');

  const askForm = document.getElementById('askForm');
  const askInput = document.getElementById('askInput');
  const aiResponse = document.getElementById('aiResponse');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    await doSearch(q);
  });

  async function doSearch(query) {
    resultsDiv.innerHTML = '<p style="color:var(--muted)">Searching...</p>';
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'unknown'}));
        resultsDiv.innerHTML = '<p style="color:#b91c1c">Error: ' + (err.error || 'Server returned an error') + '</p>';
        return;
      }
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        resultsDiv.innerHTML = '<p style="color:var(--muted)">No results found.</p>';
        return;
      }
      renderResults(data.items);
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = '<p style="color:#b91c1c">Failed to fetch results. See console.</p>';
    }
  }

  function renderResults(items) {
    resultsDiv.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'result-item';

      const thumb = document.createElement('div');
      thumb.className = 'result-thumb';
      let imgUrl = null;
      try {
        if (item.pagemap && item.pagemap.cse_image && item.pagemap.cse_image[0]) {
          imgUrl = item.pagemap.cse_image[0].src;
        }
      } catch(e){ imgUrl = null; }

      if (imgUrl) {
        thumb.innerHTML = '<img src="'+imgUrl+'" alt="" />';
      } else {
        thumb.innerHTML = '<svg width="92" height="56" viewBox="0 0 92 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="92" height="56" rx="8" fill="#eef6f0"/></svg>';
      }

      const main = document.createElement('div');
      main.className = 'result-main';
      const title = document.createElement('a');
      title.className = 'result-title';
      title.href = item.link;
      title.target = '_blank';
      title.rel = 'noopener noreferrer';
      title.textContent = item.title || item.htmlTitle || 'No title';

      const link = document.createElement('div');
      link.className = 'result-link';
      link.textContent = item.displayLink || item.formattedUrl || item.link;

      const snippet = document.createElement('div');
      snippet.className = 'result-snippet';
      snippet.textContent = item.snippet || '';

      main.appendChild(title);
      main.appendChild(link);
      main.appendChild(snippet);

      el.appendChild(thumb);
      el.appendChild(main);

      resultsDiv.appendChild(el);
    });
  }

  // Ask AI typing effect
  function typeWriterEffect(element, text, speed = 20) {
    element.textContent = "";
    let i = 0;
    function typing() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    }
    typing();
  }

  askForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = askInput.value.trim();
    if (!q) return;
    aiResponse.textContent = '🤔 Thinking...';
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'unknown'}));
        aiResponse.textContent = 'Error: ' + (err.error || 'Server error');
        return;
      }
      const data = await res.json();
      const answer = data.answer || 'No response.';
      typeWriterEffect(aiResponse, answer, 18);
    } catch (err) {
      console.error(err);
      aiResponse.textContent = '⚠️ Something went wrong. Try again later.';
    }
  });

});

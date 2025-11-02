const button = document.getElementById('submit');
const input = document.getElementById('search');

button.addEventListener('click', () => {
	alert('Merci. Tu as cherché : ' + input.value);
});

async function sendSearch()
{
	const query = document.getElementById('search').value;
	await fetch('https://n8n.srv1076432.hstgr.cloud/webhook/search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query })
	});
}


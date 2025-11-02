const button = document.getElementById('submit');
const input = document.getElementById('search');

button.addEventListener('click', () => {
	alert('Merci. Tu as cherché : ' + input.value);
	sendSearch();
});

async function sendSearch()
{
	console.log('enter in sendSearch');
	const query = document.getElementById('search').value;
	console.log(`query = _${query}_`);
	await fetch('https://n8n.srv1076432.hstgr.cloud/webhook/search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query })
	});
}


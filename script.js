// const button = document.getElementById('submit');
// const input = document.getElementById('search');

// button.addEventListener('click', async () => {
// 	console.log('clic détecté');
// 	await sendSearch();
// });

// async function sendSearch()
// {
// 	console.log('enter in sendSearch');
// 	const query = document.getElementById('search').value;
// 	console.log(`query = _${query}_`);
// 	await fetch('https://n8n.srv1076432.hstgr.cloud/webhook/search', {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify({ query })
// 	});
// }
// const data = await res.json();
// alert(`Your sheet is read! Here's the link : ${data.sheet_url}`);




const button = document.getElementById('submit');
const input = document.getElementById('search');
const resultDiv = document.getElementById('result');

button.addEventListener('click', async () => {
	const query = input.value.trim();
	if (!query)
	{
		resultDiv.textContent = "Please enter a search query.";
		return;
	}

	resultDiv.textContent = "Searching... Wait 1 minute please";

	try
	{
		const res = await fetch('https://n8n.srv1076432.hstgr.cloud/webhook/search', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query })
		});

		if (!res.ok)
			throw new Error("Server error");

		const data = await res.json();

		if (data.sheet_url)
			resultDiv.innerHTML = `
				Résult ready!<br>
				<a href="${data.sheet_url}" target="_blank">Open Spreadsheet</a>
			`;
		else
			resultDiv.textContent = "The search has ended, but no links were returned.";
	}
	catch (err)
	{
		console.error(err);
		resultDiv.textContent = "Error: unable to start search.";
	}
});

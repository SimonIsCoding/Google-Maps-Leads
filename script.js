const button = document.getElementById('submit');
const input = document.getElementById('search');

button.addEventListener('click', () => {
	alert('Tu as cherché : ' + input.value);
});

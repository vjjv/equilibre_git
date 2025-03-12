// Create and append the overlay elements
const overlay = document.createElement('div');
overlay.id = 'overlay';
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const inputContainer = document.createElement('div');
inputContainer.id = 'input-container';
inputContainer.style.textAlign = 'center';

const input = document.createElement('input');
input.type = 'text';
input.id = 'phrase';
input.placeholder = 'Enter password';
input.style.cssText = `
    padding: 10px;
    font-size: 16px;
`;

const button = document.createElement('button');
button.id = 'submit';
button.textContent = 'Start';
button.style.cssText = `
    padding: 10px 20px;
    font-size: 16px;
    margin-top: 10px;
    cursor: pointer;
`;

// Append elements
inputContainer.appendChild(input);
inputContainer.appendChild(button);
overlay.appendChild(inputContainer);
document.body.appendChild(overlay);

// Add event listener
button.addEventListener('click', function () {
    const inputPhrase = input.value.trim();
    if (inputPhrase === 'biogen') {
        overlay.style.display = 'none';
    } else {
        alert('Incorrect password. Please try again.');
    }
});

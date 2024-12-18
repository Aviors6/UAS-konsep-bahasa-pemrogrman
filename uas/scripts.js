// Elements
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoItems = document.getElementById('todoItems');
const statsDisplay = document.getElementById('statsDisplay');
const spotifyIframe = document.getElementById('spotify-iframe');

let timerInterval;
let isPaused = false;
let isWorkSession = true;
let timeRemaining = 0;
let startTime = null;

// Load timer state from localStorage
function loadTimerState() {
    const savedTimeRemaining = localStorage.getItem('timeRemaining');
    const savedIsWorkSession = localStorage.getItem('isWorkSession');
    const savedIsPaused = localStorage.getItem('isPaused');
    const savedWorkTime = localStorage.getItem('workTime');
    const savedBreakTime = localStorage.getItem('breakTime');

    if (savedTimeRemaining !== null) {
        timeRemaining = parseInt(savedTimeRemaining, 10);
    }
    if (savedIsWorkSession !== null) {
        isWorkSession = savedIsWorkSession === 'true';
    }
    if (savedIsPaused !== null) {
        isPaused = savedIsPaused === 'true';
    }
    if (savedWorkTime !== null) {
        workTimeInput.value = savedWorkTime;
    }
    if (savedBreakTime !== null) {
        breakTimeInput.value = savedBreakTime;
    }
}

// Save timer state to localStorage
function saveTimerState() {
    localStorage.setItem('timeRemaining', timeRemaining);
    localStorage.setItem('isWorkSession', isWorkSession);
    localStorage.setItem('isPaused', isPaused);
    localStorage.setItem('workTime', workTimeInput.value);
    localStorage.setItem('breakTime', breakTimeInput.value);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showNotification(message, nextAction) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const messageBox = document.createElement('div');
    messageBox.style.backgroundColor = 'black';
    messageBox.style.padding = '20px';
    messageBox.style.borderRadius = '10px';
    messageBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    messageBox.style.textAlign = 'center';

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.fontSize = '24px';
    messageText.style.marginBottom = '20px';

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '10px 20px';
    okButton.style.fontSize = '16px';
    okButton.style.backgroundColor = '#4CAF50';
    okButton.style.color = 'white';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '5px';
    okButton.style.cursor = 'pointer';

    okButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        nextAction();
    });

    messageBox.appendChild(messageText);
    messageBox.appendChild(okButton);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
}

function stopTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    timeRemaining = 0;
    updateTimerDisplay();
    saveTimerState();
    pauseSpotify();
}

function runTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeRemaining--;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (isWorkSession) {
                    showNotification('Waktu belajar selesai! Waktunya istirahat.', () => {
                        isWorkSession = false;
                        timeRemaining = parseInt(breakTimeInput.value, 10) * 60;
                        saveTimerState();
                        updateTimerDisplay();
                        runTimer();
                    });
                } else {
                    showNotification('Waktu istirahat selesai! Masukkan waktu baru.', () => {
                        isPaused = true;
                        isWorkSession = true;
                        timeRemaining = 0;
                        workTimeInput.value = '';
                        breakTimeInput.value = '';
                        localStorage.clear();
                        updateTimerDisplay();
                        pauseSpotify();
                    });
                }
            } else {
                updateTimerDisplay();
                saveTimerState();
            }
        }
    }, 1000);
}

function playSpotify() {
    spotifyIframe.src += "?autoplay=1";
}

function pauseSpotify() {
    spotifyIframe.src = spotifyIframe.src.replace("?autoplay=1", "");
}

startButton.addEventListener('click', () => {
    const workTime = parseInt(workTimeInput.value, 10);
    const breakTime = parseInt(breakTimeInput.value, 10);

    if (isNaN(workTime) || isNaN(breakTime) || workTime <= 0 || breakTime <= 0) {
        alert('Harap masukkan waktu kerja dan istirahat yang valid.');
        return;
    }

    clearInterval(timerInterval);
    timeRemaining = isWorkSession ? workTime * 60 : breakTime * 60;
    startTime = new Date();
    isPaused = false;
    updateTimerDisplay();
    saveTimerState();
    runTimer();
    playSpotify();
});

pauseButton.addEventListener('click', () => {
    isPaused = true;
    clearInterval(timerInterval);
    saveTimerState();
    pauseSpotify();
});

resetButton.addEventListener('click', stopTimer);

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoItems.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-3 border rounded';
        
        const span = document.createElement('span');
        span.textContent = todo.text;
        if (todo.completed) {
            span.className = 'line-through text-gray-500';
        }

        const buttons = document.createElement('div');

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Selesai';
        completeButton.className = 'bg-green-500 text-white px-3 py-1 rounded mr-2';
        completeButton.addEventListener('click', () => {
            todos[index].completed = !todos[index].completed;
            saveTodos();
            renderTodos();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.className = 'bg-red-500 text-white px-3 py-1 rounded';
        deleteButton.addEventListener('click', () => {             todos.splice(index, 1);
            saveTodos();
            renderTodos();
        });

        buttons.appendChild(completeButton);
        buttons.appendChild(deleteButton);
        
        li.appendChild(span);
        li.appendChild(buttons);
        todoItems.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const completed = todos.filter(todo => todo.completed).length;
    const pending = todos.length - completed;
    statsDisplay.textContent = `Total: ${todos.length}, Selesai: ${completed}, Belum Selesai: ${pending}`;
}

// Event listener for adding new todos
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (todoInput.value.trim() === '') return;

    todos.push({
        text: todoInput.value.trim(),
        completed: false
    });

    todoInput.value = '';
    saveTodos();
    renderTodos();
});

// Load initial state and render todos
loadTimerState();
updateTimerDisplay();
renderTodos();
if (!isPaused && timeRemaining > 0) {
    runTimer();
}

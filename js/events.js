const params = new URLSearchParams(window.location.search);
const nodeId = params.get('node_id');
const nodeName = params.get('node_name');

const container = document.getElementById('events-container');

if (nodeName) {
    const header = document.querySelector('header h1');
    header.textContent = `Събития в: ${decodeURIComponent(nodeName)}`;
}

if (!nodeId) {
    container.innerHTML = '<p>Не е избрана валидна локация.</p>';
} else {
    fetchEvents(nodeId);
}

// Form toggle functionality
const toggleFormBtn = document.getElementById('toggle-form-btn');
const formContainer = document.getElementById('event-form-container');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const addEventForm = document.getElementById('add-event-form');

toggleFormBtn.addEventListener('click', () => {
    const isVisible = formContainer.style.display !== 'none';
    formContainer.style.display = isVisible ? 'none' : 'block';
    toggleFormBtn.textContent = isVisible ? '+ Добави ново събитие' : '- Скрий формата';
});

cancelFormBtn.addEventListener('click', () => {
    formContainer.style.display = 'none';
    toggleFormBtn.textContent = '+ Добави ново събитие';
    addEventForm.reset();
});

addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(addEventForm);
    formData.append('node_id', nodeId);
    
    const startTime = new Date(formData.get('start_time'));
    const endTime = new Date(formData.get('end_time'));
    
    if (endTime <= startTime) {
        alert('Крайното време трябва да е след началното време.');
        return;
    }
    
    fetch('php/api.php?action=add_event', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message || 'Събитието е добавено успешно!');
            addEventForm.reset();
            formContainer.style.display = 'none';
            toggleFormBtn.textContent = '+ Добави ново събитие';
            // Refresh the events list
            fetchEvents(nodeId);
        } else {
            alert(data.error || 'Възникна грешка при добавянето на събитието.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Възникна грешка при свързването със сървъра.');
    });
});

function fetchEvents(nodeId) {
    fetch(`php/api.php?action=get_events&node_id=${nodeId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.data.length === 0) {
                container.innerHTML = '<p>Няма събития за тази локация.</p>';
                return;
            }

            const eventsList = document.createElement('ul');
            eventsList.className = 'events-list';

            const now = new Date();

            data.data.forEach(event => {
                const eventEnd = new Date(event.end_time);
                if (eventEnd < now) return;

                const li = document.createElement('li');
                li.className = 'event-item';
                li.innerHTML = `
                    <strong>${event.name}</strong><br>
                    ${event.description ? `<p style="text-align: left; margin: 10px 0; color: #666;">${event.description}</p>` : ''}
                    Начало: ${event.start_time}<br>
                    Край: ${event.end_time}<br>
                    <a href="index.html?destination=${nodeId}" class="go-to-event-btn" onclick="event.stopPropagation();">📍 Отиди на събитието</a>
                `;

                li.addEventListener('click', () => {
                    highlightSelectedEvent(li, eventsList);
                    fetchEventInterests(event.id);
                });

                eventsList.appendChild(li);
            });

            container.innerHTML = '';
            container.appendChild(eventsList);
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = '<p>Възникна грешка при зареждането на събитията.</p>';
        });
}

function highlightSelectedEvent(selectedLi, parentList) {
    parentList.querySelectorAll('.event-item').forEach(li => {
        li.style.backgroundColor = '#fff';
    });
    selectedLi.style.backgroundColor = '#e6f0ff';
}

function fetchEventInterests(eventId) {
    const eventDetails = document.getElementById('event-details');

    fetch(`php/api.php?action=get_event_interests&event_id=${eventId}`)
        .then(r => r.json())
        .then(data => {
            const isUserInterested = data.success && data.data && 
                data.data.some(user => user.is_current_user);

            eventDetails.innerHTML = `
                <h3>Заинтересовани потребители:</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="interest-checkbox" 
                               ${isUserInterested ? 'checked' : ''} 
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span>Заинтересован съм от това събитие</span>
                    </label>
                </div>
            `;

            if (!data.success || !data.data || data.data.length === 0) {
                const noUsersMsg = document.createElement('p');
                noUsersMsg.textContent = 'Все още няма потребители, заинтересовани от това събитие.';
                eventDetails.appendChild(noUsersMsg);
            } else {
                const ul = document.createElement('ul');
                ul.className = 'interested-users';

                data.data.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = user.username;
                    ul.appendChild(li);
                });

                eventDetails.appendChild(ul);
            }

            // Add event listener to checkbox
            const checkbox = document.getElementById('interest-checkbox');
            checkbox.addEventListener('change', (e) => {
                handleInterestChange(eventId, e.target.checked);
            });
        })
        .catch(err => {
            console.error(err);
            eventDetails.innerHTML = '<p>Възникна грешка при зареждането на данните.</p>';
        });
}

function handleInterestChange(eventId, isInterested) {
    const action = isInterested ? 'add_event_interest' : 'delete_event_interest';
    
    fetch(`php/api.php?action=${action}&event_id=${eventId}`, {
        method: 'POST'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            fetchEventInterests(eventId);
        } else {
            alert(data.error || 'Възникна грешка при актуализирането.');
            const checkbox = document.getElementById('interest-checkbox');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Възникна грешка при свързването със сървъра.');
        const checkbox = document.getElementById('interest-checkbox');
    });
}
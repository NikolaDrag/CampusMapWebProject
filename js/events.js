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
                    Начало: ${event.start_time}<br>
                    Край: ${event.end_time}
                `;

                li.addEventListener('click', () => {
                    highlightSelectedEvent(li, eventsList);
                    fetchEventInterests(event.id);
                });

                eventsList.appendChild(li);
            });

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
            if (!data.success || !data.data || data.data.length === 0) {
                eventDetails.innerHTML = '<p>Все още яма потребители, заинтересовани от това събитие.</p>';
                return;
            }

            const ul = document.createElement('ul');
            ul.className = 'interested-users';

            data.data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = user.username;
                ul.appendChild(li);
            });

            eventDetails.innerHTML = `<h3>Заинтересовани потребители:</h3>`;
            eventDetails.appendChild(ul);
        })
        .catch(err => {
            console.error(err);
        });
}

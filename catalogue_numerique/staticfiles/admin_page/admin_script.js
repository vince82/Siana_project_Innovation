// admin_script.js
document.addEventListener('DOMContentLoaded', () => {
    const componentTree = document.getElementById("component-tree");
    const addDeviceBtn = document.getElementById("add-device-btn");

    if (!componentTree || !addDeviceBtn) {
        console.error("Éléments HTML manquants");
        return;
    }

    // Fonction pour ajouter un appareil principal
    addDeviceBtn.addEventListener("click", async () => {
        const deviceName = prompt("Nom de l'appareil (ex: Train, Avion) :");
        if (deviceName) {
            try {
                const response = await fetch('/add-component/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        name: deviceName,
                        parent_id: null
                    })
                });
                
                if (response.ok) {
                    const newComponent = await response.json();
                    const newNode = createNode(newComponent.name, newComponent.id);
                    componentTree.appendChild(newNode);
                } else {
                    alert('Une erreur est survenue lors de la création de l\'appareil');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue lors de la création de l\'appareil');
            }
        }
    });

    // Fonction pour créer un nœud dans l'arborescence
    function createNode(name, componentId) {
        const li = document.createElement("li");
        li.setAttribute('data-component-id', componentId);
        li.innerHTML = `
            <div class="component-item">
                <span class="component-name">${name}</span>
                <button class="add-child-btn">+ Ajouter un sous-composant</button>
                <button class="edit-btn">✏️ Modifier</button>
                <button class="delete-btn">🗑️ Supprimer</button>
            </div>
            <ul class="child-components"></ul>
        `;

        // Gestionnaire pour ajouter un sous-composant
        li.querySelector(".add-child-btn").addEventListener("click", async () => {
            const childName = prompt(`Ajouter un sous-composant à "${name}" :`);
            if (childName) {
                try {
                    const response = await fetch('/add-component/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({
                            name: childName,
                            parent_id: componentId
                        })
                    });
                    
                    if (response.ok) {
                        const childComponent = await response.json();
                        const childNode = createNode(childComponent.name, childComponent.id);
                        li.querySelector(".child-components").appendChild(childNode);
                    } else {
                        alert('Une erreur est survenue lors de la création du sous-composant');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la création du sous-composant');
                }
            }
        });

        // Gestionnaires pour modifier et supprimer
        attachEditAndDeleteHandlers(li, name, componentId);

        return li;
    }

    function attachEditAndDeleteHandlers(li, name, componentId) {
        // Gestionnaire pour modifier le composant
        li.querySelector(".edit-btn").addEventListener("click", async () => {
            const newName = prompt("Nouveau nom du composant:", name);
            if (newName) {
                try {
                    const response = await fetch(`/edit-component/${componentId}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({ name: newName })
                    });
                    
                    if (response.ok) {
                        li.querySelector(".component-name").textContent = newName;
                    } else {
                        alert('Une erreur est survenue lors de la modification');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la modification');
                }
            }
        });

        // Gestionnaire pour supprimer le composant
        li.querySelector(".delete-btn").addEventListener("click", async () => {
            if (confirm(`Voulez-vous vraiment supprimer le composant "${name}" et tous ses sous-composants ?`)) {
                try {
                    const response = await fetch(`/delete-component/${componentId}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    
                    if (response.ok) {
                        li.remove();
                    } else {
                        alert('Une erreur est survenue lors de la suppression');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la suppression');
                }
            }
        });
    }

    // Fonction utilitaire pour récupérer le token CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
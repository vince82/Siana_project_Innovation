document.addEventListener('DOMContentLoaded', () => {
    // Gestion des composants (existant, ne pas toucher)
    const componentTree = document.getElementById("component-tree");
    const addDeviceBtn = document.getElementById("add-device-btn");

    function initializeExistingNode(node) {
        const componentId = node.dataset.componentId;
        const componentName = node.querySelector('.component-name').textContent;

        const addChildBtn = node.querySelector('.add-child-btn');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', async () => {
                const childName = prompt(`Ajouter un sous-composant à "${componentName}" :`);
                if (childName) {
                    try {
                        const response = await fetch('/manage/add-component/', {
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

                        if (!response.ok) {
                            throw new Error('Erreur serveur');
                        }

                        const childComponent = await response.json();
                        const childNode = createNewNode(childComponent.name, childComponent.id);

                        let childList = node.querySelector('.child-components');
                        if (!childList) {
                            childList = document.createElement('ul');
                            childList.className = 'child-components';
                            node.appendChild(childList);
                        }
                        childList.appendChild(childNode);
                    } catch (error) {
                        console.error('Erreur:', error);
                        alert('Une erreur est survenue lors de la création du sous-composant');
                    }
                }
            });
        }

        const editBtn = node.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', async () => {
                const newName = prompt("Nouveau nom du composant:", componentName);
                if (newName && newName !== componentName) {
                    try {
                        const response = await fetch(`/manage/edit-component/${componentId}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({ name: newName })
                        });

                        if (!response.ok) {
                            throw new Error('Erreur serveur');
                        }

                        node.querySelector('.component-name').textContent = newName;
                    } catch (error) {
                        console.error('Erreur:', error);
                        alert('Une erreur est survenue lors de la modification');
                    }
                }
            });
        }

        const deleteBtn = node.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm(`Voulez-vous vraiment supprimer "${componentName}" et tous ses sous-composants ?`)) {
                    try {
                        const response = await fetch(`/manage/delete-component/${componentId}/`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken')
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Erreur serveur');
                        }

                        node.remove();

                        if (componentTree.children.length === 0) {
                            window.location.reload();
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        alert('Une erreur est survenue lors de la suppression');
                    }
                }
            });
        }
    }

    document.querySelectorAll('[data-component-id]').forEach(node => {
        initializeExistingNode(node);
    });

    function createNewNode(name, id) {
        const li = document.createElement('li');
        li.className = 'component-item';
        li.dataset.componentId = id;
        li.innerHTML = `
            <div class="component-content">
                <span class="component-name">${name}</span>
                <div class="component-buttons">
                    <button class="add-child-btn">+ Ajouter</button>
                    <button class="edit-btn">✏️ Modifier</button>
                    <button class="delete-btn">🗑️ Supprimer</button>
                </div>
            </div>
        `;

        initializeExistingNode(li);
        return li;
    }

    if (addDeviceBtn) {
        addDeviceBtn.addEventListener('click', async () => {
            const deviceName = prompt("Nom de l'appareil (ex: Train, Avion) :");
            if (deviceName) {
                try {
                    const response = await fetch('/manage/add-component/', {
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

                    if (!response.ok) {
                        throw new Error('Erreur serveur');
                    }

                    const newComponent = await response.json();
                    const newNode = createNewNode(newComponent.name, newComponent.id);
                    componentTree.appendChild(newNode);
                    addDeviceBtn.style.display = 'none';
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la création de l\'appareil');
                }
            }
        });
    }

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

    // Gestion des utilisateurs (nouveau code)
    const csrfToken = getCookie('csrftoken');
    const userList = document.getElementById('user-list');
    const addUserBtn = document.getElementById('add-user-btn');

    function createUserRow(user) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-user-id', user.id);
        tr.innerHTML = `
            <td class="user-name">${user.nom_prenom}</td>
            <td class="user-email">${user.email}</td>
            <td>
                <button class="edit-user-btn">✏️</button>
                <button class="delete-user-btn">🗑️</button>
            </td>
        `;

        tr.querySelector('.edit-user-btn').addEventListener('click', () => handleEditUser(tr));
        tr.querySelector('.delete-user-btn').addEventListener('click', () => handleDeleteUser(tr));

        return tr;
    }

    addUserBtn?.addEventListener('click', async () => {
        const nom_prenom = prompt('Nom et prénom :');
        const email = prompt('Email :');
        const password = prompt('Mot de passe :');

        if (!nom_prenom || !email || !password) {
            alert('Tous les champs sont obligatoires.');
            return;
        }

        try {
            const response = await fetch('/add-user/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ nom_prenom, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur serveur');
            }

            const newUser = await response.json();
            userList.appendChild(createUserRow(newUser));
        } catch (error) {
            alert(`Erreur lors de l'ajout de l'utilisateur : ${error.message}`);
        }
    });

    async function handleEditUser(tr) {
        const userId = tr.dataset.userId;
        const currentName = tr.querySelector('.user-name').textContent;
        const currentEmail = tr.querySelector('.user-email').textContent;

        const nom_prenom = prompt('Nouveau nom et prénom :', currentName);
        const email = prompt('Nouvel email :', currentEmail);
        const password = prompt('Nouveau mot de passe (laisser vide pour ne pas changer) :');

        if (!nom_prenom || !email) {
            alert('Le nom et l\'email sont obligatoires.');
            return;
        }

        try {
            const response = await fetch(`/edit-user/${userId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ nom_prenom, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur serveur');
            }

            tr.querySelector('.user-name').textContent = nom_prenom;
            tr.querySelector('.user-email').textContent = email;
        } catch (error) {
            alert(`Erreur lors de la modification : ${error.message}`);
        }
    }

    async function handleDeleteUser(tr) {
        const userId = tr.dataset.userId;

        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            return;
        }

        try {
            const response = await fetch(`/delete-user/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur serveur');
            }

            tr.remove();
        } catch (error) {
            alert(`Erreur lors de la suppression : ${error.message}`);
        }
    }

    document.querySelectorAll('[data-user-id]').forEach((tr) => {
        tr.querySelector('.edit-user-btn')?.addEventListener('click', () => handleEditUser(tr));
        tr.querySelector('.delete-user-btn')?.addEventListener('click', () => handleDeleteUser(tr));
    });
});

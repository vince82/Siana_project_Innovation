document.addEventListener('DOMContentLoaded', () => {
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

    const componentId = document.getElementById('component-name').dataset.componentId;

    // Modifier le nom
    document.getElementById("modify-name-btn").addEventListener("click", async () => {
        const currentName = document.getElementById("component-name").textContent.replace('Nom actuel : ', '');
        const newName = prompt("Nouveau nom du composant :", currentName);
        if (newName && newName !== currentName) {
            try {
                const response = await fetch(`/manage/edit-component/${componentId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (!response.ok) throw new Error('Erreur serveur');
                document.getElementById("component-name").textContent = `Nom actuel : ${newName}`;
            } catch (error) {
                alert('Erreur lors de la modification du nom');
            }
        }
    });

    // Gestion des paragraphes de description
    document.getElementById("add-paragraph-btn").addEventListener("click", async () => {
        const description = prompt("Entrez la description :");
        if (description) {
            try {
                const response = await fetch('/manage/add-paragraph/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        component_id: componentId,
                        description: description
                    })
                });

                if (!response.ok) throw new Error('Erreur serveur');
                
                const newParagraph = await response.json();
                const paragraphHTML = createParagraphElement(newParagraph);
                document.getElementById("description-container").appendChild(paragraphHTML);
            } catch (error) {
                alert('Erreur lors de l\'ajout du paragraphe');
            }
        }
    });

    // Fonction pour créer un élément de paragraphe
    function createParagraphElement(paragraph) {
        const div = document.createElement('div');
        div.className = 'description-item';
        div.dataset.paragrapheId = paragraph.id;
        div.innerHTML = `
            <p>${paragraph.description}</p>
            <div class="description-actions">
                <button class="edit-btn">Modifier</button>
                <button class="add-image-btn">Ajouter une image</button>
                <button class="delete-btn">Supprimer</button>
            </div>
            <div class="paragraphe-images"></div>
        `;

        // Ajouter les gestionnaires d'événements pour les boutons
        attachParagraphEventListeners(div);
        return div;
    }

    // Gestionnaires pour les paragraphes existants
    document.querySelectorAll('.description-item').forEach(attachParagraphEventListeners);

    function attachParagraphEventListeners(paragraphElement) {
        const paragraphId = paragraphElement.dataset.paragrapheId;

        // Modifier le paragraphe
        paragraphElement.querySelector('.edit-btn').addEventListener('click', async () => {
            const currentText = paragraphElement.querySelector('p').textContent;
            const newText = prompt("Modifier le paragraphe :", currentText);
            if (newText && newText !== currentText) {
                try {
                    const response = await fetch(`/manage/edit-paragraph/${paragraphId}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({ description: newText })
                    });

                    if (!response.ok) throw new Error('Erreur serveur');
                    paragraphElement.querySelector('p').textContent = newText;
                } catch (error) {
                    alert('Erreur lors de la modification du paragraphe');
                }
            }
        });

        // Supprimer le paragraphe
        paragraphElement.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm('Voulez-vous vraiment supprimer ce paragraphe ?')) {
                try {
                    const response = await fetch(`/manage/delete-paragraph/${paragraphId}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });

                    if (!response.ok) throw new Error('Erreur serveur');
                    paragraphElement.remove();
                } catch (error) {
                    alert('Erreur lors de la suppression du paragraphe');
                }
            }
        });

        // Ajouter une image
        paragraphElement.querySelector('.add-image-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('paragraphe_id', paragraphId);

                    try {
                        const response = await fetch('/manage/add-image/', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: formData
                        });

                        if (!response.ok) throw new Error('Erreur serveur');
                        
                        const imageData = await response.json();
                        const img = document.createElement('img');
                        img.src = imageData.url;
                        paragraphElement.querySelector('.paragraphe-images').appendChild(img);
                    } catch (error) {
                        alert('Erreur lors de l\'ajout de l\'image');
                    }
                }
            };
            input.click();
        });
    }

    

});


// Gestion des détails techniques
document.getElementById("add-detail-btn").addEventListener("click", () => {
    // Créer un formulaire plus élaboré
    const form = document.createElement('div');
    form.innerHTML = `
        <div class="detail-form">
            <div>
                <label>Caractéristique:</label>
                <input type="text" id="detail-name" />
            </div>
            <div>
                <label>Valeur:</label>
                <input type="text" id="detail-value" />
            </div>
            <div>
                <button id="save-detail">Sauvegarder</button>
                <button id="cancel-detail">Annuler</button>
            </div>
        </div>
    `;
    
    // Insérer le formulaire avant le bouton d'ajout
    document.getElementById("add-detail-btn").before(form);
    
    document.getElementById("save-detail").onclick = async () => {
        const caractéristique = document.getElementById("detail-name").value;
        const valeur = document.getElementById("detail-value").value;
        
        if (caractéristique && valeur) {
            try {
                const response = await fetch('/manage/add-technical-detail/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        component_id: componentId,
                        caractéristique,
                        valeur
                    })
                });

                if (!response.ok) throw new Error('Erreur serveur');
                
                const newDetail = await response.json();
                const newRow = createDetailRow(newDetail);
                document.querySelector('#technical-details-table tbody').appendChild(newRow);
                form.remove();
            } catch (error) {
                alert('Erreur lors de l\'ajout du détail technique');
            }
        }
    };
    
    document.getElementById("cancel-detail").onclick = () => {
        form.remove();
    };
});


// Gestion du modèle 3D
// Modification du gestionnaire pour le modèle 3D
document.getElementById('import-model-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.blend,.obj,.fbx,.gltf,.glb,.dae,.3ds'; // Ajout des formats Blender
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('model3D', file);
            formData.append('component_id', componentId);

            try {
                // Afficher un indicateur de chargement
                const placeholder = document.querySelector('.model-placeholder');
                placeholder.innerHTML = 'Chargement en cours...';
                
                const response = await fetch('/manage/upload-3d-model/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                if (!response.ok) throw new Error('Erreur serveur');
                
                const modelData = await response.json();
                placeholder.innerHTML = `
                    <p>Modèle 3D chargé : ${modelData.filename}</p>
                `;
            } catch (error) {
                alert('Erreur lors de l\'upload du modèle 3D');
                placeholder.innerHTML = '[Espace pour le modèle 3D]';
            }
        }
    };
    input.click();
});

// Gestion des documents
// Pour les documents
document.getElementById('add-document-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const progressDiv = document.createElement('div');
            progressDiv.innerHTML = `Upload en cours : ${file.name}...`;
            document.getElementById('documents-list').appendChild(progressDiv);

            const formData = new FormData();
            formData.append('document', file);
            formData.append('component_id', componentId);

            try {
                const response = await fetch('/manage/upload-document/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                if (!response.ok) throw new Error('Erreur serveur');
                
                const docData = await response.json();
                progressDiv.remove();
                const docElement = createDocumentElement(docData);
                document.getElementById('documents-list').appendChild(docElement);
            } catch (error) {
                progressDiv.innerHTML = 'Erreur lors du chargement';
                setTimeout(() => progressDiv.remove(), 3000);
            }
        }
    };
    input.click();
});


// Gestion des vidéos
document.getElementById('change-video-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('component_id', componentId);

            try {
                const response = await fetch('/manage/upload-video/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                if (!response.ok) throw new Error('Erreur serveur');
                
                const videoData = await response.json();
                updateVideoPlayer(videoData);
            } catch (error) {
                alert('Erreur lors de l\'upload de la vidéo');
            }
        }
    };
    input.click();
});

function updateVideoPlayer(videoData) {
    const videoContainer = document.querySelector('.video-container');
    videoContainer.innerHTML = `
        <video controls>
            <source src="${videoData.url}" type="video/mp4">
            Votre navigateur ne supporte pas les vidéos HTML5.
        </video>
        <button class="delete-video-btn">Supprimer</button>
        <button id="change-video-btn">Changer la vidéo</button>
    `;
    
    // Réattacher les gestionnaires d'événements
    document.getElementById('change-video-btn').addEventListener('click', this);
}


// Ajoutez cette fonction dans votre JavaScript
function createDocumentElement(docData) {
    const div = document.createElement('div');
    div.className = 'document-item';
    div.dataset.documentId = docData.id;
    div.innerHTML = `
        <a href="${docData.url}" target="_blank">${docData.filename}</a>
        <button class="delete-document-btn">Supprimer</button>
    `;
    
    div.querySelector('.delete-document-btn').addEventListener('click', async () => {
        if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
            try {
                const response = await fetch(`/manage/delete-document/${docData.id}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                
                if (!response.ok) throw new Error('Erreur serveur');
                div.remove();
            } catch (error) {
                alert('Erreur lors de la suppression du document');
            }
        }
    });
    
    return div;
}


// Dans votre JavaScript
function init3DViewer(modelUrl) {
    const container = document.getElementById('3d-viewer');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Lumière
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);
    
    // Chargeur de modèle
    const loader = new THREE.GLTFLoader();
    loader.load(modelUrl, (gltf) => {
        scene.add(gltf.scene);
        // Ajuster la caméra pour voir le modèle
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        camera.position.copy(center);
        camera.position.z += Math.max(size.x, size.y, size.z) * 2;
    });
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}



function createDocumentElement(docData) {
    const div = document.createElement('div');
    div.className = 'document-item';
    div.dataset.documentId = docData.id;
    
    if (docData.url.endsWith('.pdf')) {
        div.innerHTML = `
            <div class="document-preview">
                <iframe src="${docData.url}" width="100%" height="500px"></iframe>
            </div>
            <div class="document-actions">
                <a href="${docData.url}" target="_blank" class="open-btn">Ouvrir</a>
                <button class="delete-document-btn">Supprimer</button>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="document-info">
                <span>${docData.filename}</span>
                <div class="document-actions">
                    <a href="${docData.url}" target="_blank" class="open-btn">Ouvrir</a>
                    <button class="delete-document-btn">Supprimer</button>
                </div>
            </div>
        `;
    }
    
    return div;
}
function updateVideoPlayer(videoData) {
    const videoContainer = document.querySelector('.video-container');
    videoContainer.innerHTML = `
        <video controls width="100%">
            <source src="${videoData.url}" type="video/mp4">
            Votre navigateur ne supporte pas les vidéos HTML5.
        </video>
        <div class="video-controls">
            <button class="delete-video-btn">Supprimer</button>
            <button id="change-video-btn">Changer la vidéo</button>
        </div>
    `;
}

function createDetailRow(detail) {
    const tr = document.createElement('tr');
    tr.dataset.detailId = detail.id;
    tr.innerHTML = `
        <td>${detail.caractéristique}</td>
        <td>${detail.valeur}</td>
        <td>
            <button class="edit-detail-btn">Modifier</button>
            <button class="delete-detail-btn">Supprimer</button>
        </td>
    `;

    // Ajouter les gestionnaires d'événements
    tr.querySelector('.edit-detail-btn').addEventListener('click', () => {
        const newCarac = prompt('Nouvelle caractéristique:', detail.caractéristique);
        const newVal = prompt('Nouvelle valeur:', detail.valeur);
        
        if (newCarac && newVal) {
            fetch(`/manage/edit-technical-detail/${detail.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    caractéristique: newCarac,
                    valeur: newVal
                })
            })
            .then(response => {
                if (response.ok) {
                    tr.cells[0].textContent = newCarac;
                    tr.cells[1].textContent = newVal;
                } else {
                    throw new Error('Erreur lors de la modification');
                }
            })
            .catch(error => alert(error.message));
        }
    });

    tr.querySelector('.delete-detail-btn').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment supprimer ce détail ?')) {
            fetch(`/manage/delete-technical-detail/${detail.id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                if (response.ok) {
                    tr.remove();
                } else {
                    throw new Error('Erreur lors de la suppression');
                }
            })
            .catch(error => alert(error.message));
        }
    });

    return tr;
}
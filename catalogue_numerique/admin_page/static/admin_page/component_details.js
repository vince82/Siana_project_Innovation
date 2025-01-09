class Model3DViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.model = null;
        this.setupViewer();
    }

    setupViewer() {
        // Configuration du renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0xf0f0f0);
        this.container.appendChild(this.renderer.domElement);

        // Configuration de la caméra
        this.camera.position.z = 5;

        // Ajout des contrôles OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Éclairage
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(ambientLight, directionalLight);

        // Animation
        this.animate();

        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.onWindowResize());
    }

    loadModel(url) {
        // Suppression du modèle existant si présent
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }

        let loader;
        const extension = url.split('.').pop().toLowerCase();
        
        switch(extension) {
            case 'blend':
                loader = new THREE.BlendLoader();
                break;
            case 'fbx':
                loader = new THREE.FBXLoader();
                break;
            case 'obj':
                loader = new THREE.OBJLoader();
                break;
            default:
                loader = new THREE.GLTFLoader();
        }
        
        loader.load(url, (gltf) => {
            this.model = gltf.scene;
            
            // Centrer et ajuster l'échelle du modèle
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            this.model.scale.multiplyScalar(scale);
            
            this.model.position.sub(center.multiplyScalar(scale));
            
            this.scene.add(this.model);
        }, 
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% chargé');
        },
        (error) => {
            console.error('Erreur de chargement du modèle:', error);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    dispose() {
        this.controls.dispose();
        this.renderer.dispose();
    }
}

// Initialisation du viewer
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new Model3DViewer('3d-viewer');
    window.viewer3D = viewer;  // Pour accès global

    // Gestion du téléchargement de modèle
    const importModelBtn = document.getElementById('import-model-btn');
    if (importModelBtn) {
        importModelBtn.addEventListener('click', async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.glb,.gltf,.blend,.fbx,.obj';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('model3D', file);
                    formData.append('component_id', componentId);

                    try {
                        const response = await fetch('/manage/upload-3d-model/', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: formData
                        });

                        if (response.ok) {
                            const data = await response.json();
                            document.getElementById('3d-viewer').style.display = 'block';
                            viewer.loadModel(URL.createObjectURL(file));
                        }
                    } catch (error) {
                        alert('Erreur lors du téléversement du modèle 3D');
                    }
                }
            };
            input.click();
        });
    }

    // Charger le modèle existant s'il y en a un
    const modelContainer = document.getElementById('model-container');
    if (modelContainer.dataset.modelUrl) {
        document.getElementById('3d-viewer').style.display = 'block';
        viewer.loadModel(modelContainer.dataset.modelUrl);
    }
});



document.addEventListener('DOMContentLoaded', () => {
    

    // 1. Modification du nom du composant
    const modifyNameBtn = document.getElementById('modify-name-btn');
    if (modifyNameBtn) {
        modifyNameBtn.addEventListener('click', async () => {
            const currentName = document.getElementById('component-name').textContent.replace('Nom actuel : ', '');
            const newName = prompt('Nouveau nom du composant:', currentName);
            
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

                    if (response.ok) {
                        document.getElementById('component-name').textContent = `Nom actuel : ${newName}`;
                    } else {
                        throw new Error('Erreur lors de la modification du nom');
                    }
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    }

    // 2. Gestion du modèle 3D
    const importModelBtn = document.getElementById('import-model-btn');
    if (importModelBtn) {
        importModelBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.glb,.gltf';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('model3D', file);
                    formData.append('component_id', componentId);

                    try {
                        const response = await fetch('/manage/upload-3d-model/', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: formData
                        });

                        if (response.ok) {
                            location.reload();
                        } else {
                            throw new Error('Erreur lors du téléversement du modèle 3D');
                        }
                    } catch (error) {
                        alert(error.message);
                    }
                }
            };
            input.click();
        });
    }


    const addDetailBtn = document.getElementById('add-detail-btn');
    if (addDetailBtn) {
        addDetailBtn.addEventListener('click', async () => {
            // Demander à l'utilisateur d'entrer la caractéristique et la valeur
            const caractéristique = prompt("Entrez la caractéristique (par exemple : 'Poids'):");
            if (!caractéristique) {
                alert("La caractéristique est obligatoire.");
                return;
            }

            const valeur = prompt("Entrez la valeur (par exemple : '2kg'):");
            if (!valeur) {
                alert("La valeur est obligatoire.");
                return;
            }

            try {
                const response = await fetch('/manage/add-technical-detail/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        component_id: componentId,
                        caractéristique: caractéristique,
                        valeur: valeur
                    })
                });

                if (response.ok) {
                    location.reload(); // Recharger la page pour afficher la nouvelle caractéristique
                } else {
                    const error = await response.json();
                    alert(`Erreur : ${error.error}`);
                }
            } catch (error) {
                alert('Erreur lors de l\'ajout de la caractéristique : ' + error.message);
            }
        });
    }

    
    
    

    // 3. Gestion des paragraphes
    const addParagraphBtn = document.getElementById('add-paragraph-btn');
    const paragraphModal = document.getElementById('paragraph-modal');
    const closeParagraphModal = paragraphModal.querySelector('.close');
    const saveParagraphBtn = document.getElementById('save-paragraph-btn');

    // Ouvrir modal
    addParagraphBtn.onclick = () => {
        paragraphModal.style.display = 'block';
    };

    // Fermer modal
    closeParagraphModal.onclick = () => {
        paragraphModal.style.display = 'none';
    };

    // Sauvegarder paragraphe
    saveParagraphBtn.onclick = async () => {
        const description = document.getElementById('paragraph-text').value;
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

                if (response.ok) {
                    location.reload();
                } else {
                    throw new Error('Erreur lors de l\'ajout du paragraphe');
                }
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Gérer les images des paragraphes
    document.querySelectorAll('.add-image-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const paragrapheId = this.closest('.description-item').dataset.paragrapheId;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);

                    try {
                        const response = await fetch(`/manage/add-image-to-paragraph/${paragrapheId}/`, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: formData
                        });

                        if (response.ok) {
                            location.reload();
                        } else {
                            throw new Error('Erreur lors de l\'ajout de l\'image');
                        }
                    } catch (error) {
                        alert(error.message);
                    }
                }
            };
            input.click();
        });
    });

    // 4. Gestion des documents
    const addDocumentBtn = document.getElementById('add-document-btn');
    if (addDocumentBtn) {
        addDocumentBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
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

                        if (response.ok) {
                            location.reload();
                        } else {
                            throw new Error('Erreur lors du téléversement du document');
                        }
                    } catch (error) {
                        alert(error.message);
                    }
                }
            };
            input.click();
        });
    }

    // 5. Gestion des vidéos
    const changeVideoBtn = document.getElementById('change-video-btn');
    if (changeVideoBtn) {
        changeVideoBtn.addEventListener('click', () => {
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

                        if (response.ok) {
                            location.reload();
                        } else {
                            throw new Error('Erreur lors du téléversement de la vidéo');
                        }
                    } catch (error) {
                        alert(error.message);
                    }
                }
            };
            input.click();
        });
    }

    // 6. Suppression des éléments
    // Supprimer paragraphes
    document.querySelectorAll('.description-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('Voulez-vous vraiment supprimer ce paragraphe ?')) {
                const paragrapheId = this.closest('.description-item').dataset.paragrapheId;
                try {
                    const response = await fetch(`/manage/delete-paragraph/${paragrapheId}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });

                    if (response.ok) {
                        this.closest('.description-item').remove();
                    } else {
                        throw new Error('Erreur lors de la suppression');
                    }
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    });

    // Supprimer documents
    document.querySelectorAll('.delete-document-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
                const documentId = this.closest('.document-item').dataset.documentId;
                try {
                    const response = await fetch(`/manage/delete-document/${documentId}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });

                    if (response.ok) {
                        this.closest('.document-item').remove();
                    } else {
                        throw new Error('Erreur lors de la suppression');
                    }
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    });

    // Supprimer vidéos
    document.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            // Récupérer l'ID de la vidéo à partir de l'attribut data-video-id
            const videoId = this.closest('.video-wrapper').querySelector('video').dataset.videoId;

            if (!videoId) {
                alert("ID de la vidéo introuvable. Vérifiez le HTML.");
                console.error("ID de la vidéo introuvable");
                return;
            }

            if (confirm('Voulez-vous vraiment supprimer cette vidéo ?')) {
                try {
                    const response = await fetch(`/manage/delete-video/${videoId}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });

                    if (response.ok) {
                        location.reload();  // Recharge la page pour mettre à jour la liste des vidéos
                    } else {
                        const error = await response.json();
                        alert(`Erreur : ${error.error}`);
                    }
                } catch (error) {
                    alert('Erreur de suppression : ' + error.message);
                }
            }
        });
    });    
});
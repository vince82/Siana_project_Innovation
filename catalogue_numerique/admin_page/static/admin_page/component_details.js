// JavaScript pour gérer les interactions de component_details.html

document.addEventListener("DOMContentLoaded", function() {

    // Modifier le nom du composant
    const modifyNameBtn = document.getElementById("modify-name-btn");
    modifyNameBtn?.addEventListener("click", function() {
        const nameSpan = document.getElementById("component-name");
        const newName = prompt("Entrez le nouveau nom :", nameSpan.textContent);
        if (newName) {
            const componentId = nameSpan.dataset.componentId;
            fetch(`/edit-component/${componentId}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            }).then(response => {
                if (response.ok) {
                    nameSpan.textContent = newName;
                } else {
                    alert("Erreur lors de la modification du nom.");
                }
            });
        }
    });

    // Importer un modèle 3D
    const importModelBtn = document.getElementById("import-model-btn");
    importModelBtn?.addEventListener("click", function() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".glb,.gltf,.blend,.fbx,.obj";
        input.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("model3D", file);
                formData.append("component_id", document.getElementById("component-name").dataset.componentId);

                fetch(`/upload-3d-model/`, {
                    method: "POST",
                    body: formData
                }).then(response => {
                    if (response.ok) {
                        alert("Modèle 3D importé avec succès.");
                        location.reload(); // Recharge pour afficher le modèle
                    } else {
                        alert("Erreur lors de l'importation du modèle 3D.");
                    }
                });
            }
        });
        input.click();
    });

    // Ajouter un paragraphe
    const addParagraphBtn = document.getElementById("add-paragraph-btn");
    addParagraphBtn?.addEventListener("click", function() {
        const text = prompt("Entrez le contenu du paragraphe :");
        if (text) {
            const componentId = document.getElementById("component-name").dataset.componentId;
            fetch(`/add-paragraph/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ component_id: componentId, description: text })
            }).then(response => {
                if (response.ok) {
                    alert("Paragraphe ajouté avec succès.");
                    location.reload();
                } else {
                    alert("Erreur lors de l'ajout du paragraphe.");
                }
            });
        }
    });

    // Ajouter un détail technique
    const addDetailBtn = document.getElementById("add-detail-btn");
    addDetailBtn?.addEventListener("click", function() {
        const caractéristique = prompt("Entrez la caractéristique :");
        const valeur = prompt("Entrez la valeur :");
        if (caractéristique && valeur) {
            const componentId = document.getElementById("component-name").dataset.componentId;
            fetch(`/add-technical-detail/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ component_id: componentId, caractéristique, valeur })
            }).then(response => {
                if (response.ok) {
                    alert("Détail technique ajouté avec succès.");
                    location.reload();
                } else {
                    alert("Erreur lors de l'ajout du détail technique.");
                }
            });
        }
    });

    // Ajouter un document
    const addDocumentBtn = document.getElementById("add-document-btn");
    addDocumentBtn?.addEventListener("click", function() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";
        input.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("document", file);
                formData.append("component_id", document.getElementById("component-name").dataset.componentId);

                fetch(`/upload-document/`, {
                    method: "POST",
                    body: formData
                }).then(response => {
                    if (response.ok) {
                        alert("Document ajouté avec succès.");
                        location.reload();
                    } else {
                        alert("Erreur lors de l'ajout du document.");
                    }
                });
            }
        });
        input.click();
    });

    // Ajouter une vidéo
    const changeVideoBtn = document.getElementById("change-video-btn");
    changeVideoBtn?.addEventListener("click", function() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".mp4,.mov";
        input.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("video", file);
                formData.append("component_id", document.getElementById("component-name").dataset.componentId);

                fetch(`/upload-video/`, {
                    method: "POST",
                    body: formData
                }).then(response => {
                    if (response.ok) {
                        alert("Vidéo ajoutée avec succès.");
                        location.reload();
                    } else {
                        alert("Erreur lors de l'ajout de la vidéo.");
                    }
                });
            }
        });
        input.click();
    });
});

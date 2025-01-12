document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.getElementById("search-bar");
    const searchResults = document.getElementById("search-results");
    const modelViewer = document.querySelector("model-viewer");
    const componentName = document.getElementById("component-name");
    const technicalSheetButton = document.getElementById("view-technical-sheet");
    const treeItems = document.querySelectorAll(".tree-item");
    let selectedComponentId = null;

    // Gestion de la recherche dynamique
    searchBar.addEventListener("input", function () {
        const query = searchBar.value.trim();
        if (query.length > 0) {
            fetch(`/technician/search/?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    searchResults.innerHTML = ""; // Effacer les résultats précédents
                    data.forEach(item => {
                        const resultItem = document.createElement("div");
                        resultItem.textContent = item.name;
                        resultItem.dataset.id = item.id;
                        resultItem.classList.add("search-result-item");

                        // Gestion du clic sur un résultat
                        resultItem.addEventListener("click", function () {
                            selectedComponentId = item.id;
                            componentName.textContent = `Modèle 3D de ${item.name}`;
                            loadModel3D(selectedComponentId);
                            searchResults.innerHTML = ""; // Cacher les résultats
                            searchBar.value = ""; // Réinitialiser la barre de recherche
                        });

                        searchResults.appendChild(resultItem);
                    });
                })
                .catch(error => console.error("Erreur lors de la recherche :", error));
        } else {
            searchResults.innerHTML = ""; // Vider les résultats si aucun texte n'est entré
        }
    });

    // Charger le modèle 3D d'un composant sélectionné
    function loadModel3D(componentId) {
        fetch(`/technician/get-component-3d/${componentId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.model3d_url) {
                    modelViewer.src = data.model3d_url; // Mettre à jour la source du modèle 3D
                    technicalSheetButton.disabled = false; // Activer le bouton Fiche Technique
                } else {
                    alert("Aucun modèle 3D disponible pour ce composant.");
                    technicalSheetButton.disabled = true; // Désactiver le bouton Fiche Technique
                }
            })
            .catch(error => {
                console.error("Erreur lors du chargement du modèle 3D :", error);
                alert("Impossible de charger le modèle 3D. Veuillez réessayer.");
            });
    }

    // Gestion des clics dans l'arborescence
    treeItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedComponentId = this.dataset.id;
            const componentNameText = this.textContent.trim();
            componentName.textContent = `Modèle 3D de ${componentNameText}`;
            loadModel3D(selectedComponentId);

            // Ajouter une classe active au composant sélectionné
            treeItems.forEach(el => el.classList.remove("active")); // Retirer l'état actif des autres éléments
            this.classList.add("active"); // Ajouter l'état actif au composant cliqué
        });
    });

    // Gestion du bouton Fiche Technique
    technicalSheetButton.addEventListener("click", function () {
        if (selectedComponentId) {
            // Rediriger vers la fiche technique du composant
            window.location.href = `/technician/component-sheet/${selectedComponentId}/`;
        }
    });
});

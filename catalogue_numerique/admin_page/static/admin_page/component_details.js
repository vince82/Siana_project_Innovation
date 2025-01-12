document.addEventListener("DOMContentLoaded", function () {
    /** ============================
     *  Gestion des Modèles 3D
     *  ============================
     */
    const modelUploadForm = document.querySelector("form[action*='upload_3d_model']");
    const modelDeleteForm = document.querySelector("form[action*='delete_3d_model']");

    if (modelUploadForm) {
        modelUploadForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="model-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après ajout ou remplacement du modèle
            };
            modelUploadForm.submit();
        });
    }

    if (modelDeleteForm) {
        modelDeleteForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="model-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après suppression du modèle
            };
            modelDeleteForm.submit();
        });
    }

    /** ============================
     *  Gestion des Vidéos
     *  ============================
     */
    const videoUploadForm = document.querySelector("form[action*='upload_video']");

    if (videoUploadForm) {
        videoUploadForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="video-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après ajout ou remplacement de la vidéo
            };
            videoUploadForm.submit();
        });
    }

    document.querySelectorAll(".delete-video-btn").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.preventDefault();
            const form = btn.closest("form");
            const targetIframe = document.querySelector('iframe[name="video-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après suppression de la vidéo
            };
            form.submit();
        });
    });

    /** ============================
     *  Gestion des Paragraphes
     *  ============================
     */
    const paragraphForms = document.querySelectorAll("form[action*='edit_paragraph'], form[action*='add_paragraph'], form[action*='delete_paragraph']");

    paragraphForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="paragraph-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après modification ou suppression d'un paragraphe
            };
            form.submit();
        });
    });

    const imageUploadForms = document.querySelectorAll("form[action*='add_image_to_paragraph']");
    imageUploadForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="paragraph-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après ajout d'une image
            };
            form.submit();
        });
    });

    const imageReplaceForms = document.querySelectorAll("form[action*='replace_image']");
    imageReplaceForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="paragraph-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après remplacement d'une image
            };
            form.submit();
        });
    });

    const imageDeleteForms = document.querySelectorAll("form[action*='delete_image']");
    imageDeleteForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="paragraph-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après suppression d'une image
            };
            form.submit();
        });
    });

    /** ============================
     *  Gestion des Détails Techniques
     *  ============================
     */
    const technicalForms = document.querySelectorAll("form[action*='add_technical_detail'], form[action*='edit_technical_detail'], form[action*='delete_technical_detail']");

    technicalForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="details-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après ajout, modification ou suppression d'un détail technique
            };
            form.submit();
        });
    });

    /** ============================
     *  Gestion des Documents
     *  ============================
     */
    const documentUploadForm = document.querySelector("form[action*='upload_document']");

    if (documentUploadForm) {
        documentUploadForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="document-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après ajout de documents
            };
            documentUploadForm.submit();
        });
    }

    document.querySelectorAll(".delete-document-btn").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.preventDefault();
            const form = btn.closest("form");
            const targetIframe = document.querySelector('iframe[name="document-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir après suppression d'un document
            };
            form.submit();
        });
    });

    /** ============================
     *  Gestion du Nom du Composant
     *  ============================
     */
    const nameForm = document.querySelector("form[action*='edit_component']");

    if (nameForm) {
        nameForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetIframe = document.querySelector('iframe[name="name-response-frame"]');
            targetIframe.onload = function () {
                location.reload(); // Rafraîchir pour afficher le nouveau nom
            };
            nameForm.submit();
        });
    }
});

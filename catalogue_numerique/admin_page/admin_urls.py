from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='admin_login'),
    path('logout/', views.logout_view, name='admin_logout'),
    path('home/', views.home_view, name='admin_home'),
    path('component/<int:component_id>/details/', views.component_details_view, name='component_details'),
    
    # URLs pour les composants
    path('add-component/', views.add_component, name='add_component'),
    path('edit-component/<int:component_id>/', views.edit_component, name='edit_component'),
    path('delete-component/<int:component_id>/', views.delete_component, name='delete_component'),

    
]

urlpatterns = urlpatterns+[
    path('component/<int:component_id>/details/', views.component_details_view, name='component_details'),

    # Modification du nom du composant
    path('edit-component/<int:component_id>/', views.edit_component, name='edit_component'),

    # Gestion des modèles 3D
    path('upload-3d-model/', views.upload_3d_model, name='upload_3d_model'),
    path('delete-3d-model/<int:model_id>/', views.delete_3d_model, name='delete_3d_model'),

    # Gestion des paragraphes
    path('add-paragraph/', views.add_paragraph, name='add_paragraph'),
    path('edit-paragraph/<int:paragraph_id>/', views.edit_paragraph, name='edit_paragraph'),
    path('delete-paragraph/<int:paragraph_id>/', views.delete_paragraph, name='delete_paragraph'),
    path('add-image-to-paragraph/<int:paragraph_id>/', views.add_image_to_paragraph, name='add_image_to_paragraph'),
    path('replace-image/<int:image_id>/', views.replace_image, name='replace_image'),
    path('delete-image/<int:image_id>/', views.delete_image, name='delete_image'),

    # Gestion des détails techniques
    path('add-technical-detail/', views.add_technical_detail, name='add_technical_detail'),
    path('edit-technical-detail/<int:detail_id>/', views.edit_technical_detail, name='edit_technical_detail'),
    path('delete-technical-detail/<int:detail_id>/', views.delete_technical_detail, name='delete_technical_detail'),

    # Gestion des documents
    path('upload-document/', views.upload_document, name='upload_document'),
    path('delete-document/<int:document_id>/', views.delete_document, name='delete_document'),

    # Gestion des vidéos
    path('upload-video/', views.upload_video, name='upload_video'),
    path('delete-video/<int:video_id>/', views.delete_video, name='delete_video'),
]
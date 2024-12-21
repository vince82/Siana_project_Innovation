from django.db import models

# Create your models here.
class admin_user(models.Model):
    nom_prenom=models.CharField(max_length=20)
    email=models.EmailField(max_length=254)
    password=models.CharField(max_length=30)
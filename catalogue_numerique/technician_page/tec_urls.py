from django.urls import path
from . import views
urlpatterns = [
    path('',views.login_view,name='login'),
    path('technician/logout/',views.login_view,name='logout'),
    path('technician/home/',views.home_view,name='home'),
]

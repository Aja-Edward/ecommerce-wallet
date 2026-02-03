from django.urls import path
from .views import RegisterUserView, LoginUserView, ProfileView

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("login/", LoginUserView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),  # ADDED
]
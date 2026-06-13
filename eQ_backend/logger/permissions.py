from rest_framework import permissions


class IsStaffOrReadOnly(permissions.BasePermission):
    """Allow read-only access to any request, but only allow write
    operations (create/update/delete) for staff users.

    Used to restrict route (Boulder) and zone (Wall) management to gym
    staff / setters, who are identified by Django's ``is_staff`` flag.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

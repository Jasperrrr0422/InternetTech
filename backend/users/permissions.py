from rest_framework import permissions  

class IsUserRole(permissions.BasePermission):  
    """  
    只允许角色为 'user' 的用户访问  
    """  
    def has_permission(self, request, view):  
        return request.user.is_authenticated and request.user.role == 'user'  


class IsAdminRole(permissions.BasePermission):  
    """  
    只允许角色为 'admin' 的用户访问  
    """  
    def has_permission(self, request, view):  
        return request.user.is_authenticated and request.user.role == 'admin'  


class IsOwnerRole(permissions.BasePermission):  
    """  
    只允许角色为 'owner' 的用户访问  
    """  
    def has_permission(self, request, view):  
        return request.user.is_authenticated and request.user.role == 'owner'
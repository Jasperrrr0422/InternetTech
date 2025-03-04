from django.apps import AppConfig


class PropertiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'properties'

    def ready(self):
        from watson import search as watson
        watson.register(self.get_model('Hotel'), fields=('name', 'description', 'address'))